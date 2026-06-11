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
