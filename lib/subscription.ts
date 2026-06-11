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

  // Check if still in 3-day free trial
  const trialEnd = new Date(org.createdAt).getTime() + (TRIAL_DAYS * DAY_IN_MS);
  const isTrialValid = trialEnd > Date.now();

  const isSubValid =
    org.razorpayPlanId &&
    org.razorpayCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isSubValid || isTrialValid;
};

// You can use these constants later when generating the pricing page UI
export const PRICING_TIERS = {
  FREE: {
    name: "Free",
    maxUsers: 1,
    maxLeads: 50,
  },
  PRO: {
    name: "Pro",
    maxUsers: 5,
    maxLeads: 1000,
    planId: process.env.NEXT_PUBLIC_RAZORPAY_PRO_PLAN_ID,
  },
  PROMAX: {
    name: "Pro Max",
    maxUsers: 20,
    maxLeads: 10000,
    planId: process.env.NEXT_PUBLIC_RAZORPAY_PROMAX_PLAN_ID,
  },
  ENTERPRISE: {
    name: "Enterprise",
    maxUsers: 9999, // Unlimited
    maxLeads: 999999, // Unlimited
  },
};
