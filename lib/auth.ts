/**
 * OrvixCRM — Supabase Auth helper
 *
 * This is a drop-in bridge so server components and actions can get the
 * current user without importing from @supabase/ssr directly everywhere.
 *
 * Usage in a Server Component or Server Action:
 *   import { getUser, requireUser } from "@/lib/auth";
 *   const user = await getUser();
 */
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export type AppUser = {
  id: string;
  email: string;
  supabase_uid: string;
  name: string;
  role: string;
  avatar: string | null;
  organization_id: string | null;
};

/**
 * Returns the current Supabase auth user + their OrvixCRM profile.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<AppUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Look up the user's OrvixCRM profile by their supabase_uid
    const profile = await prisma.users.findFirst({
      where: { supabase_uid: user.id },
      select: {
        id: true,
        email: true,
        supabase_uid: true,
        name: true,
        role: true,
        avatar: true,
        organization_id: true,
      },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email ?? user.email ?? "",
      supabase_uid: profile.supabase_uid ?? user.id,
      name: profile.name ?? "",
      role: profile.role ?? "user",
      avatar: profile.avatar,
      organization_id: profile.organization_id,
    };
  } catch {
    return null;
  }
}

/**
 * Like getUser() but throws a redirect to /sign-in if not authenticated.
 * Use in Server Components that require authentication.
 */
export async function requireUser(): Promise<AppUser> {
  const user = await getUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/en/sign-in");
  }
  return user;
}

/**
 * Checks if the current user has one of the specified roles.
 */
export async function hasRole(
  roles: string | string[]
): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(user.role);
}

/**
 * Returns true if the current user is an admin.
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(["admin", "superAdmin"]);
}
