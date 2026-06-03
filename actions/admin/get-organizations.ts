"use server";

import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";

export const getOrganizations = async () => {
  try {
    const session = await getSession();
    
    // Ensure the user is a super admin or admin
    if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return [];
    }

    const organizations = await prismadb.organization.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return organizations.map((org: any) => ({
      ...org,
      usersCount: org._count.users,
    }));
  } catch (error) {
    console.error("[GET_ORGANIZATIONS_ERROR]", error);
    return [];
  }
};
