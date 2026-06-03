import { prismadb as prisma } from "@/lib/prisma";

export interface InboundLeadInput {
  lastName: string;
  firstName?: string;
  email?: string;
  phone?: string;
  company?: string;
  description?: string;
  channel: string;
  lead_source_id?: string;
  organization_id?: string;
  whatsapp_number?: string;
}

/**
 * Checks for duplicates by phone first, then email.
 * - If found: Updates existing lead (appends message/description) and returns isDuplicate: true.
 * - If not found: Creates a new lead and returns isDuplicate: false.
 */
export async function findOrCreateLeadWithDuplicateCheck(
  input: InboundLeadInput
) {
  const { email, phone, organization_id } = input;

  let existingLead = null;

  // 1. Check Phone duplicate
  if (phone) {
    existingLead = await prisma.crm_Leads.findFirst({
      where: {
        phone,
        deletedAt: null,
        ...(organization_id ? { organization_id } : {}),
      },
    });
  }

  // 2. Check Email duplicate
  if (!existingLead && email) {
    existingLead = await prisma.crm_Leads.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(organization_id ? { organization_id } : {}),
      },
    });
  }

  if (existingLead) {
    // Action: Update Existing Lead (append new message to description)
    const newDescription = input.description
      ? existingLead.description
        ? `${existingLead.description}\n\n[New Inquiry via ${input.channel}]: ${input.description}`
        : input.description
      : existingLead.description;

    const updatedLead = await prisma.crm_Leads.update({
      where: { id: existingLead.id },
      data: {
        firstName: input.firstName ?? existingLead.firstName,
        lastName: input.lastName !== "Unknown" ? input.lastName : existingLead.lastName,
        company: input.company ?? existingLead.company,
        description: newDescription,
        whatsapp_number: input.whatsapp_number ?? existingLead.whatsapp_number,
        updatedAt: new Date(),
      },
    });

    return { lead: updatedLead, isDuplicate: true };
  }

  // 3. Create new lead
  const newLead = await prisma.crm_Leads.create({
    data: {
      v: 0,
      lastName: input.lastName,
      firstName: input.firstName,
      email: input.email,
      phone: input.phone,
      company: input.company,
      description: input.description,
      channel: input.channel,
      lead_source_id: input.lead_source_id,
      organization_id: input.organization_id,
      whatsapp_number: input.whatsapp_number,
    },
  });

  return { lead: newLead, isDuplicate: false };
}
