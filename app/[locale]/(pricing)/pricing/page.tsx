// Server Component — no "use client" here, safe to use Prisma imports from server-side libs
import React from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICING_TIERS } from "@/lib/constants";
import { SubscribeButton } from "./components/SubscribeButton";

export default function PricingPage() {
  return (
    <>
      <div className="min-h-screen bg-background flex flex-col items-center py-20 px-4 relative">
        <div className="absolute top-8 left-8">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="text-center space-y-4 mb-16 mt-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose the plan that best fits your needs.
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
              <SubscribeButton tier="FREE" label="Select Free" variant="outline" />
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
              <SubscribeButton tier="PRO" label="Subscribe to Pro" />
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
              <SubscribeButton tier="PROMAX" label="Subscribe to Pro Max" />
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
              <SubscribeButton tier="ENTERPRISE" label="Contact Sales" variant="outline" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
