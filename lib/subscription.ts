import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

const DAY_IN_MS = 86_400_000;
const TRIAL_DAYS = 3;

export const checkSubscription = async () => {
  const session = await getSession();
  const organizationId = session?.user?.organization_id;

  if (!organizationId) {
    return false;
  }

  const org = await prismadb.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      razorpaySubscriptionId: true,
      razorpayCurrentPeriodEnd: true,
      razorpayCustomerId: true,
      razorpayPlanId: true,
      createdAt: true,
    },
  });

  if (!org) {
    return false;
  }

  const isSubValid =
    org.razorpayPlanId &&
    org.razorpayCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isSubValid;
};


