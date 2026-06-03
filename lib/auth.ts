import { prismadb as prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AppUser = {
  id: string;
  email: string;
  supabase_uid: string;
  name: string;
  role: string;
  avatar: string | null;
  organization_id: string | null;
  userStatus: string;
  userLanguage: string;
};

/**
 * Returns the current auth user + their OPENALGON CRM profile.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<AppUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Supabase auth user found, now fetch profile from our Users table
    let profile = await prisma.users.findFirst({
      where: { supabase_uid: user.id },
      select: {
        id: true,
        email: true,
        supabase_uid: true,
        name: true,
        role: true,
        avatar: true,
        organization_id: true,
        userStatus: true,
        userLanguage: true,
      },
    });

    if (!profile) {
      try {
        // Check if user already exists by email (to link account instead of crashing on unique constraint)
        if (user.email) {
          const existingUser = await prisma.users.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            const updatedProfile = await prisma.users.update({
              where: { id: existingUser.id },
              data: {
                supabase_uid: user.id,
                name: existingUser.name || user.user_metadata?.full_name || user.email.split("@")[0],
                avatar: existingUser.avatar || user.user_metadata?.avatar_url || null,
              },
            });
            profile = {
              id: updatedProfile.id,
              email: updatedProfile.email,
              supabase_uid: updatedProfile.supabase_uid,
              name: updatedProfile.name,
              role: updatedProfile.role,
              avatar: updatedProfile.avatar,
              organization_id: updatedProfile.organization_id,
              userStatus: updatedProfile.userStatus,
              userLanguage: updatedProfile.userLanguage,
            };
          }
        }

        // If still no profile, create a new one
        if (!profile) {
          const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "New User";
          const newProfile = await prisma.users.create({
            data: {
              supabase_uid: user.id,
              email: user.email || "",
              name: userName,
              avatar: user.user_metadata?.avatar_url || null,
              userStatus: "ACTIVE",
              organization: {
                create: {
                  name: `${userName}'s Workspace`,
                  plan: "free",
                }
              }
            },
          });
          profile = {
            id: newProfile.id,
            email: newProfile.email,
            supabase_uid: newProfile.supabase_uid,
            name: newProfile.name,
            role: newProfile.role,
            avatar: newProfile.avatar,
            organization_id: newProfile.organization_id,
            userStatus: newProfile.userStatus,
            userLanguage: newProfile.userLanguage,
          };
        }
      } catch (err) {
        console.error("Failed to auto-create user profile", err);
        return null;
      }
    }

    return {
      id: profile.id,
      email: profile.email ?? user.email ?? "",
      supabase_uid: profile.supabase_uid ?? user.id,
      name: profile.name ?? "",
      role: profile.role ?? "user",
      avatar: profile.avatar,
      organization_id: profile.organization_id,
      userStatus: profile.userStatus,
      userLanguage: profile.userLanguage,
    };
  } catch (error) {
    console.error("Auth error:", error);
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
    throw new Error("Redirecting...");
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

/**
 * Backward compatibility wrapper for getSession() 
 * which many existing files still import.
 */
export async function getSession(): Promise<{ user: AppUser } | null> {
  const user = await getUser();
  if (!user) return null;
  return { user };
}
