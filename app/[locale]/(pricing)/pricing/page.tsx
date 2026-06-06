"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { PRICING_TIERS } from "@/lib/subscription";

export default function PricingPage() {
  const handleSubscribe = (tier: string) => {
    // Implement Stripe checkout logic here later
    alert(`Subscribing to ${tier} tier... Stripe integration pending.`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-20 px-4">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Your free trial has expired or you need to select a plan to access the CRM. Choose the plan that best fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {/* FREE */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{PRICING_TIERS.FREE.name}</CardTitle>
            <CardDescription>For individuals just getting started</CardDescription>
            <div className="text-3xl font-bold mt-4">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Up to {PRICING_TIERS.FREE.maxUsers} User</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Up to {PRICING_TIERS.FREE.maxLeads} Leads</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Basic Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" onClick={() => handleSubscribe("FREE")}>Select Free</Button>
          </CardFooter>
        </Card>

        {/* PRO */}
        <Card className="flex flex-col border-primary shadow-lg relative">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
          <CardHeader>
            <CardTitle>{PRICING_TIERS.PRO.name}</CardTitle>
            <CardDescription>For growing teams and small businesses</CardDescription>
            <div className="text-3xl font-bold mt-4">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Up to {PRICING_TIERS.PRO.maxUsers} Users</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Up to {PRICING_TIERS.PRO.maxLeads} Leads</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Priority Support</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Advanced Analytics</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSubscribe("PRO")}>Subscribe to Pro</Button>
          </CardFooter>
        </Card>

        {/* PROMAX */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{PRICING_TIERS.PROMAX.name}</CardTitle>
            <CardDescription>For established businesses scaling up</CardDescription>
            <div className="text-3xl font-bold mt-4">$99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Up to {PRICING_TIERS.PROMAX.maxUsers} Users</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Up to {PRICING_TIERS.PROMAX.maxLeads.toLocaleString()} Leads</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> 24/7 Dedicated Support</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Custom Integrations</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSubscribe("PROMAX")}>Subscribe to Pro Max</Button>
          </CardFooter>
        </Card>

        {/* ENTERPRISE */}
        <Card className="flex flex-col bg-muted/50">
          <CardHeader>
            <CardTitle>{PRICING_TIERS.ENTERPRISE.name}</CardTitle>
            <CardDescription>For large organizations with custom needs</CardDescription>
            <div className="text-3xl font-bold mt-4">Custom</div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Unlimited Users</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Unlimited Leads</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> White-glove Onboarding</li>
              <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Dedicated Account Manager</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" onClick={() => handleSubscribe("ENTERPRISE")}>Contact Sales</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
