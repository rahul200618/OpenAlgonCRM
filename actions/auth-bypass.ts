"use server";

import { cookies } from "next/headers";
import { prismadb as prisma } from "@/lib/prisma";

const DEFAULT_BYPASS_USER = {
  name: "Developer Admin",
  email: "admin@openalgoncrm.com",
  role: "admin" as const,
  userStatus: "ACTIVE" as const,
  userLanguage: "en" as const,
  supabase_uid: "dev-admin-uid-1234",
};

/**
 * Check if the current Supabase configuration is using placeholder values.
 */
function isPlaceholderConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return url.includes("placeholder-project.supabase.co") || !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/**
 * Retrieves all users in the database for the developer bypass dropdown.
 * If the database is completely empty (unseeded), it seeds a default administrator user.
 */
export async function getBypassUsers() {
  if (!isPlaceholderConfig()) {
    console.log("[Developer Bypass] Supabase URL is not a placeholder, returning empty bypass users.");
    return [];
  }

  console.log("[Developer Bypass] getBypassUsers called. Checking local database connection...");
  try {
    const dbQueryPromise = prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        created_on: "desc",
      },
    });

    // Timeout database query after 1.5 seconds to prevent hanging if DB is completely unreachable
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 1500)
    );

    let users = await Promise.race([dbQueryPromise, timeoutPromise]);
    console.log(`[Developer Bypass] Database connection successful. Found ${users.length} users.`);

    // If no users exist, automatically seed a default admin user
    if (users.length === 0) {
      console.log("[Developer Bypass] No users in database. Seeding default admin user...");
      const seededUser = await prisma.users.create({
        data: {
          ...DEFAULT_BYPASS_USER,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
      users = [seededUser];
      console.log("[Developer Bypass] Default admin user seeded successfully.");
    }

    return users;
  } catch (error: any) {
    console.warn("[Developer Bypass] Database is unreachable. Error:", error.message || error);
    console.log("[Developer Bypass] Falling back to Offline Mock Admin profile.");
    // Database connection is offline, return offline fallback user
    return [
      {
        id: "dev-offline-mock-uid",
        name: "Offline Mock Admin (No DB)",
        email: "admin@openalgoncrm.com",
        role: "admin",
      },
    ];
  }
}

/**
 * Sets the developer bypass cookie for the selected user.
 */
export async function loginBypass(userId: string) {
  if (!isPlaceholderConfig()) {
    throw new Error("Bypass login is only allowed in local development mode.");
  }

  try {
    // If it's the offline fallback user, log in directly without querying DB
    if (userId === "dev-offline-mock-uid") {
      const cookieStore = await cookies();
      cookieStore.set("dev_bypass_user_id", userId, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return { success: true };
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("Selected user does not exist in the database.");
    }

    const cookieStore = await cookies();
    cookieStore.set("dev_bypass_user_id", userId, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to log in via bypass." };
  }
}
