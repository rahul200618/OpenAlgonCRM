"use server";

import crypto from "crypto";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createInvite = async (email?: string) => {
  try {
    const session = await getSession();
    
    if (!session?.user || !session.user.organization_id) {
      return { error: "Unauthorized" };
    }

    const org = await prismadb.organization.findUnique({
      where: { id: session.user.organization_id },
      include: { users: true },
    });

    if (!org) {
      return { error: "Organization not found" };
    }

    // Check pricing tier seat limits
    const maxSeats = org.plan === "enterprise" ? 9999 : (org.plan === "pro" ? 5 : 1);
    const activeSeats = org.users.length;
    
    // We optionally count active invites as well to be strict, but let's just check active users
    if (activeSeats >= maxSeats) {
      return { error: `Your current plan (${org.plan}) is limited to ${maxSeats} user(s). Please upgrade to invite more.` };
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Invite expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await prismadb.organizationInvite.create({
      data: {
        organizationId: session.user.organization_id,
        token,
        email: email || null,
        expiresAt,
      },
    });

    revalidatePath("/organization/settings");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${appUrl}/invite/${token}`;

    return { success: true, inviteLink };
  } catch (error) {
    console.error("[CREATE_INVITE_ERROR]", error);
    return { error: "Failed to create invitation" };
  }
};
