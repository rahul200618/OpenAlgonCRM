import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user || !user.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return new NextResponse("Plan ID is required", { status: 400 });
    }

    const organization = await prismadb.organization.findUnique({
      where: { id: user.organization_id },
    });

    if (!organization) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys are missing.");
      return new NextResponse("Payment gateway not configured", { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create a Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120, // 10 years of subscription max per instance
      notes: {
        organizationId: organization.id,
        userId: user.id,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[RAZORPAY_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
