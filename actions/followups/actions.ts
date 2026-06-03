"use server";

import { prismadb as prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getFollowups() {
  const user = await requireUser();
  const isAdminUser = user.role === "admin" || user.role === "superAdmin";

  const followups = await prisma.followup.findMany({
    where: {
      ...(isAdminUser ? {} : { assignedUser: user.id }),
    },
    include: {
      lead: {
        select: {
          firstName: true,
          lastName: true,
          company: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      followupDate: "asc",
    },
  });

  return followups;
}

export async function createFollowup(
  leadId: string,
  date: Date,
  note?: string
) {
  const user = await requireUser();

  try {
    const followup = await prisma.followup.create({
      data: {
        leadId,
        assignedUser: user.id,
        followupDate: new Date(date),
        note,
        status: "pending",
      },
    });

    revalidatePath("/followups");
    revalidatePath(`/crm/leads/${leadId}`);
    return { success: true, followup };
  } catch (err: any) {
    console.error("Failed to create followup:", err);
    return { success: false, error: err.message || "Failed to create followup" };
  }
}

export async function completeFollowup(id: string) {
  await requireUser();

  try {
    const followup = await prisma.followup.update({
      where: { id },
      data: {
        status: "completed",
      },
    });

    revalidatePath("/followups");
    revalidatePath(`/crm/leads/${followup.leadId}`);
    return { success: true, followup };
  } catch (err: any) {
    console.error("Failed to complete followup:", err);
    return { success: false, error: err.message || "Failed to complete followup" };
  }
}
