"use server";
import { getSession } from "@/lib/auth-server";

export async function getCurrentRole() {
  const session = await getSession();
  if (!session) return null;
  return session.user.role;
}
