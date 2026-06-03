"use server";

import { requireUser } from "@/lib/auth";
import { assignLead, AssignmentStrategy } from "@/lib/assignment-engine";
import { revalidatePath } from "next/cache";

export async function assignLeadAction(
  leadId: string,
  strategy: AssignmentStrategy,
  targetUserId?: string
) {
  const user = await requireUser();

  try {
    const result = await assignLead(leadId, strategy, {
      organizationId: user.organization_id ?? undefined,
      targetUserId,
      assignedById: user.id,
    });

    revalidatePath("/crm/leads");
    return { success: true, ...result };
  } catch (err: any) {
    console.error("Failed to assign lead:", err);
    return { success: false, error: err.message || "Failed to assign lead" };
  }
}
