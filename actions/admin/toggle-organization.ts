"use server";

import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const toggleOrganizationStatus = async (organizationId: string, status: "active" | "suspended") => {
  try {
    const session = await getSession();
    
    // Ensure the user is a super admin or admin
    if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return { error: "Unauthorized" };
    }

    if (!organizationId) {
      return { error: "Organization ID is required" };
    }

    // Prevent an admin from suspending their own organization
    if (session.organization_id === organizationId) {
      return { error: "You cannot suspend your own organization" };
    }

    await prismadb.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        status,
      },
    });

    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (error) {
    console.error("[TOGGLE_ORG_STATUS_ERROR]", error);
    return { error: "Failed to update organization status" };
  }
};
