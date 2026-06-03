/**
 * OPENALGON CRM — Webhook endpoint for Website Forms
 *
 * Generic POST endpoint for any website contact/lead form.
 * Accepts flexible JSON payload and maps common field names.
 *
 * Use this with:
 * - Custom HTML forms
 * - Webflow
 * - WordPress CF7 / Gravity Forms
 * - Any form builder with webhook support
 *
 * Optional: set WEBSITE_WEBHOOK_SECRET in .env to require
 * Authorization: Bearer <secret> header.
 */
import { NextRequest, NextResponse } from "next/server";
import { prismadb as prisma } from "@/lib/prisma";
import { assignLead } from "@/lib/assignment-engine";
import { findOrCreateLeadWithDuplicateCheck } from "@/lib/webhook-duplicate-check";

export async function POST(request: NextRequest) {
  // Optional bearer auth
  const secret = process.env.WEBSITE_WEBHOOK_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const webhookLog = await prisma.webhookLog.create({
    data: {
      source: "website",
      payload: body,
      status: "received",
    },
  });

  try {
    // Flexible field mapping — handle common naming conventions
    const get = (...keys: string[]) => {
      for (const k of keys) {
        if (body[k]) return String(body[k]);
      }
      return undefined;
    };

    const firstName = get("first_name", "firstName", "fname");
    const lastName = get("last_name", "lastName", "lname", "name") ?? "Unknown";
    const email = get("email", "email_address");
    const phone = get("phone", "phone_number", "mobile", "tel");
    const company = get("company", "company_name", "organization");
    const message = get("message", "description", "notes", "comment");

    const source = await prisma.crm_Lead_Sources.upsert({
      where: { name: "Website Form" },
      create: { v: 0, name: "Website Form" },
      update: {},
    });

    const { lead, isDuplicate } = await findOrCreateLeadWithDuplicateCheck({
      lastName,
      firstName,
      email,
      phone,
      company,
      description: message,
      channel: "website",
      lead_source_id: source.id,
    });

    if (!isDuplicate) {
      try {
        await assignLead(lead.id, "round_robin");
      } catch (assignErr) {
        console.warn("Lead created but assignment failed:", assignErr);
      }
    }

    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { status: "processed", leadId: lead.id },
    });

    return NextResponse.json(
      { received: true, leadId: lead.id },
      { status: 201 }
    );
  } catch (err) {
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { status: "failed", error: String(err) },
    });
    console.error("Website webhook processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
