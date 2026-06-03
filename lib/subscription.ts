import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const session = await getSession();
  const organizationId = session?.organization_id;

  if (!organizationId) {
    return false;
  }

  const org = await prismadb.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!org) {
    return false;
  }

  const isValid =
    org.stripePriceId &&
    org.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isValid;
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
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  ENTERPRISE: {
    name: "Enterprise",
    maxUsers: 9999, // Unlimited
    maxLeads: 999999, // Unlimited
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
};
