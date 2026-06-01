/**
 * OrvixCRM — Custom/Flexible Webhook Endpoint
 *
 * Accepts any JSON payload. Field mapping is configured via
 * the CUSTOM_FIELD_MAP environment variable (JSON string) or
 * falls back to sensible defaults.
 *
 * Example CUSTOM_FIELD_MAP:
 * {
 *   "name": "contact_name",
 *   "email": "contact_email",
 *   "phone": "mobile_phone"
 * }
 *
 * Auth: set CUSTOM_WEBHOOK_SECRET for bearer token protection.
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignLead } from "@/lib/assignment-engine";

export async function POST(request: NextRequest) {
  const secret = process.env.CUSTOM_WEBHOOK_SECRET;
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
      source: "custom",
      payload: body,
      status: "received",
    },
  });

  try {
    // Load custom field map from env or use defaults
    let fieldMap: Record<string, string> = {
      name: "name",
      first_name: "first_name",
      last_name: "last_name",
      email: "email",
      phone: "phone",
      company: "company",
      message: "message",
    };

    if (process.env.CUSTOM_FIELD_MAP) {
      try {
        fieldMap = { ...fieldMap, ...JSON.parse(process.env.CUSTOM_FIELD_MAP) };
      } catch {
        console.warn("Invalid CUSTOM_FIELD_MAP JSON, using defaults");
      }
    }

    const get = (key: string) => {
      const mapped = fieldMap[key];
      return body[mapped] ? String(body[mapped]) : undefined;
    };

    const fullName = get("name") ?? "";
    const nameParts = fullName.split(" ");
    const firstName = get("first_name") ?? (nameParts.length > 1 ? nameParts[0] : "");
    const lastName = get("last_name") ?? (nameParts.length > 1 ? nameParts.slice(1).join(" ") : fullName) || "Unknown";

    const source = await prisma.crm_Lead_Sources.upsert({
      where: { name: "Custom Webhook" },
      create: { v: 0, name: "Custom Webhook" },
      update: {},
    });

    const lead = await prisma.crm_Leads.create({
      data: {
        v: 0,
        lastName,
        firstName,
        email: get("email"),
        phone: get("phone"),
        company: get("company"),
        description: get("message"),
        channel: "api",
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

    return NextResponse.json(
      { received: true, leadId: lead.id },
      { status: 201 }
    );
  } catch (err) {
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { status: "failed", error: String(err) },
    });
    console.error("Custom webhook processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
