"use server";

import { prismadb as prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleFeatureFlag(key: string, enabled: boolean) {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized — admin only");
  }

  await prisma.featureFlag.update({
    where: { key },
    data: { enabled },
  });

  revalidatePath("/", "layout");
}

export async function getFeatureFlag(key: string): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({
    where: { key },
    select: { enabled: true },
  });
  return flag?.enabled ?? true;
}

export async function getAllFeatureFlags(): Promise<Record<string, boolean>> {
  const flags = await prisma.featureFlag.findMany({
    select: { key: true, enabled: true },
  });
  return Object.fromEntries(flags.map((f: { key: string; enabled: boolean }) => [f.key, f.enabled]));
}
