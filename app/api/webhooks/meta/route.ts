/**
 * OrvixCRM — Webhook endpoint for Meta Lead Ads
 *
 * Meta sends two types of requests:
 * 1. GET — webhook verification (hub.challenge)
 * 2. POST — new lead notification
 *
 * Setup in Meta Business Manager:
 * - Callback URL: https://your-domain.com/api/webhooks/meta
 * - Verify Token: set META_WEBHOOK_VERIFY_TOKEN in .env
 * - Subscribe to: leadgen
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignLead } from "@/lib/assignment-engine";
import crypto from "crypto";

// GET — Webhook verification (Meta hub.challenge handshake)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Meta webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST — Receive lead data from Meta Lead Ads
export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify Meta signature (X-Hub-Signature-256)
  const signature = request.headers.get("x-hub-signature-256");
  if (process.env.META_APP_SECRET && signature) {
    const rawBody = JSON.stringify(body);
    const expected = `sha256=${crypto
      .createHmac("sha256", process.env.META_APP_SECRET)
      .update(rawBody)
      .digest("hex")}`;
    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  // Log the webhook immediately
  const webhookLog = await prisma.webhookLog.create({
    data: {
      source: "meta",
      payload: body,
      status: "received",
    },
  });

  // Process each entry asynchronously
  try {
    const entries = body.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "leadgen") continue;

        const leadData = change.value;

        // Find or create a "Meta Lead Ads" source
        const source = await prisma.crm_Lead_Sources.upsert({
          where: { name: "Meta Lead Ads" },
          create: { v: 0, name: "Meta Lead Ads" },
          update: {},
        });

        // Create the lead
        const lead = await prisma.crm_Leads.create({
          data: {
            v: 0,
            lastName: leadData.field_data?.find((f: any) => f.name === "last_name")?.values?.[0] ?? "Unknown",
            firstName: leadData.field_data?.find((f: any) => f.name === "first_name")?.values?.[0] ?? "",
            email: leadData.field_data?.find((f: any) => f.name === "email")?.values?.[0],
            phone: leadData.field_data?.find((f: any) => f.name === "phone_number")?.values?.[0],
            channel: "meta",
            lead_source_id: source.id,
          },
        });

        // Auto-assign via round-robin
        try {
          await assignLead(lead.id, "round_robin");
        } catch (assignErr) {
          console.warn("Lead created but assignment failed:", assignErr);
        }

        // Update log with lead ID
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
    console.error("Meta webhook processing error:", err);
  }

  // Always return 200 to Meta quickly
  return NextResponse.json({ received: true }, { status: 200 });
}
