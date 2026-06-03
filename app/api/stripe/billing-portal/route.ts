import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user || !session?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organization = await prismadb.organization.findUnique({
      where: { id: session.organization_id },
    });

    if (!organization || !organization.stripeCustomerId) {
      return new NextResponse("Organization or Stripe Customer not found", { status: 404 });
    }

    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/organization/settings`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_BILLING_PORTAL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
