/**
 * OPENALGON CRM — Webhook endpoint for WhatsApp Business API
 *
 * WhatsApp sends two types of requests:
 * 1. GET — Webhook verification handshake (hub.challenge)
 * 2. POST — New messages / incoming leads
 *
 * Setup:
 * - Callback URL: https://your-domain.com/api/webhooks/whatsapp
 * - Verify Token: set WHATSAPP_WEBHOOK_VERIFY_TOKEN in .env
 */
import { NextRequest, NextResponse } from "next/server";
import { prismadb as prisma } from "@/lib/prisma";
import { assignLead } from "@/lib/assignment-engine";
import crypto from "crypto";
import { findOrCreateLeadWithDuplicateCheck } from "@/lib/webhook-duplicate-check";

// GET — Webhook verification challenge
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST — Incoming message payload
export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify X-Hub-Signature-256 if WHATSAPP_APP_SECRET is set
  const signature = request.headers.get("x-hub-signature-256");
  if (process.env.WHATSAPP_APP_SECRET && signature) {
    const rawBody = JSON.stringify(body);
    const expected = `sha256=${crypto
      .createHmac("sha256", process.env.WHATSAPP_APP_SECRET)
      .update(rawBody)
      .digest("hex")}`;
    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  // Create immediate WebhookLog
  const webhookLog = await prisma.webhookLog.create({
    data: {
      source: "whatsapp",
      payload: body,
      status: "received",
    },
  });

  try {
    const entries = body.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "messages") continue;

        const value = change.value;
        const contact = value?.contacts?.[0];
        const message = value?.messages?.[0];

        if (!contact || !message) continue;

        const fullName = contact.profile?.name ?? "Unknown WhatsApp Contact";
        const nameParts = fullName.split(" ");
        const firstName = nameParts.length > 1 ? nameParts[0] : "";
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : fullName;
        const waId = contact.wa_id ?? message.from;
        const messageBody = message.text?.body ?? "";

        // Find or create "WhatsApp" source
        const source = await prisma.crm_Lead_Sources.upsert({
          where: { name: "WhatsApp" },
          create: { v: 0, name: "WhatsApp" },
          update: {},
        });

        const { lead, isDuplicate } = await findOrCreateLeadWithDuplicateCheck({
          lastName,
          firstName,
          phone: `+${waId}`,
          whatsapp_number: waId,
          description: messageBody || "Initiated contact via WhatsApp",
          channel: "whatsapp",
          lead_source_id: source.id,
        });

        if (!isDuplicate) {
          try {
            await assignLead(lead.id, "round_robin");
          } catch (assignErr) {
            console.warn("WhatsApp lead created but assignment failed:", assignErr);
          }
        }

        // Update log with success
        await prisma.webhookLog.update({
          where: { id: webhookLog.id },
          data: { status: "processed", leadId: lead.id },
        });
      }
    }
  } catch (err) {
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { status: "failed", error: String(err) },
    });
    console.error("WhatsApp webhook processing error:", err);
  }

  // Always return 200 to WhatsApp immediately
  return NextResponse.json({ received: true }, { status: 200 });
}
