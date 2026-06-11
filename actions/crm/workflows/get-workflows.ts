import { prismadb as prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function getWorkflows() {
  const session = await getSession();
  if (!session?.user) return [];

  const workflows = await prisma.workflow.findMany({
    where: {
      organization_id: session.user.organization_id || undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return workflows;
}
