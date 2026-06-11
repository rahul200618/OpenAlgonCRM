"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PRICING_TIERS } from "@/lib/constants";
import { toast } from "sonner";

interface SubscribeButtonProps {
  tier: string;
  label: string;
  variant?: "default" | "outline";
}

export function SubscribeButton({ tier, label, variant = "default" }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (tier === "FREE" || tier === "ENTERPRISE") {
      alert(`Contacting support for ${tier} tier...`);
      return;
    }

    setLoading(true);
    try {
      const planId = (PRICING_TIERS as any)[tier].planId;
      
      const response = await fetch("/api/razorpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { subscriptionId, keyId } = await response.json();

      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: "OpenAlgon CRM",
        description: `${(PRICING_TIERS as any)[tier].name} Plan Subscription`,
        handler: function (response: any) {
          toast.success("Payment successful! Access granted.");
          window.location.href = "/";
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp1.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button className="w-full" variant={variant} onClick={handleSubscribe} disabled={loading}>
      {loading ? "Loading..." : label}
    </Button>
  );
}
