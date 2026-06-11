import crypto from "crypto";
import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new NextResponse("Missing signature", { status: 400 });
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET");
      return new NextResponse("Webhook secret not configured", { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "subscription.charged" || event.event === "subscription.activated") {
      const subscription = event.payload.subscription.entity;
      
      const organizationId = subscription.notes?.organizationId;
      if (!organizationId) {
        return new NextResponse("Missing organization ID in notes", { status: 400 });
      }

      await prismadb.organization.update({
        where: { id: organizationId },
        data: {
          razorpaySubscriptionId: subscription.id,
          razorpayCustomerId: subscription.customer_id,
          razorpayPlanId: subscription.plan_id,
          razorpayCurrentPeriodEnd: new Date(subscription.current_end * 1000),
          status: "active",
        },
      });
    }

    if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
      const subscription = event.payload.subscription.entity;
      
      const organizationId = subscription.notes?.organizationId;
      if (organizationId) {
        await prismadb.organization.update({
          where: { id: organizationId },
          data: {
            status: "inactive",
            razorpayCurrentPeriodEnd: new Date(subscription.current_end * 1000), // Access remains until end of billing cycle
          },
        });
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[RAZORPAY_WEBHOOK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
