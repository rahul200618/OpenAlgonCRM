import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user || !session?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { priceId, successUrl, cancelUrl } = body;

    if (!priceId) {
      return new NextResponse("Price ID is required", { status: 400 });
    }

    const organization = await prismadb.organization.findUnique({
      where: { id: session.organization_id },
    });

    if (!organization) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    // Prepare Stripe checkout session configuration
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.email || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1, // Base subscription
        },
      ],
      metadata: {
        organizationId: organization.id,
        userId: user.id,
      },
      client_reference_id: organization.id,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
