/**
 * OrvixCRM — Webhook endpoint for Google Lead Form Extensions
 *
 * Google sends lead data via webhook when a user submits a Google Ads Lead Form.
 * Configure in Google Ads: Tools → Lead Forms → Webhook integration
 *
 * Env vars needed:
 * - GOOGLE_WEBHOOK_SECRET — used to verify X-Google-Signature header
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignLead } from "@/lib/assignment-engine";

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Optional: verify Google-specific headers
  const googleKey = request.headers.get("google-key");
  if (process.env.GOOGLE_WEBHOOK_SECRET && googleKey !== process.env.GOOGLE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookLog = await prisma.webhookLog.create({
    data: {
      source: "google",
      payload: body,
      status: "received",
    },
  });

  try {
    // Google Lead Form payload structure
    const userData = body.user_column_data ?? [];
    const getName = (key: string) =>
      userData.find((c: any) => c.column_name === key)?.string_value ?? "";

    const source = await prisma.crm_Lead_Sources.upsert({
      where: { name: "Google Lead Form" },
      create: { v: 0, name: "Google Lead Form" },
      update: {},
    });

    const lead = await prisma.crm_Leads.create({
      data: {
        v: 0,
        lastName: getName("LAST_NAME") || getName("FULL_NAME") || "Unknown",
        firstName: getName("FIRST_NAME"),
        email: getName("EMAIL"),
        phone: getName("PHONE_NUMBER"),
        channel: "google",
        lead_source_id: source.id,
      },
    });

    try {
      await assignLead(lead.id, "round_robin");
    } catch (assignErr) {
      console.warn("Lead created but assignment failed:", assignErr);
    }

    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { status: "processed", leadId: lead.id },
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { status: "failed", error: String(err) },
    });
    console.error("Google webhook processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
