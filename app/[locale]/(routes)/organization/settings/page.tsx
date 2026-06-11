import { Suspense } from "react";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Building2, CreditCard, Users, Settings2, ShieldCheck, Mail } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InviteUserForm } from "./_components/InviteUserForm";

export default async function OrganizationSettingsPage() {
  const session = await getSession();
  
  if (!session?.user?.organization_id) {
    redirect("/");
  }

  const org = await prismadb.organization.findUnique({
    where: { id: session.user.organization_id },
    include: {
      users: true,
    }
  });

  if (!org) {
    redirect("/");
  }

  const isPro = org.plan === "pro";
  const isEnterprise = org.plan === "enterprise";
  
  const planName = org.plan.charAt(0).toUpperCase() + org.plan.slice(1);
  const seatsUsed = org.users?.length || 0;
  const maxSeats = isEnterprise ? "Unlimited" : (isPro ? 5 : 1);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s settings and members here.
        </p>
      </div>

      <div className="grid gap-8">
        
        {/* Workspace Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Workspace Profile
            </CardTitle>
            <CardDescription>Update your organization's name and details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none">Workspace Name</label>
              <Input defaultValue={org.name} className="max-w-md" />
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 px-6 py-4">
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        {/* Subscription & Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Subscription & Billing
            </CardTitle>
            <CardDescription>Manage your plan, payment methods, and invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">{planName} Plan</p>
                  <Badge variant={org.status === "active" ? "default" : "destructive"}>
                    {org.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {seatsUsed} of {maxSeats} seats currently in use.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">Manage Billing</Button>
                <Button>Upgrade Plan</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team Members
            </CardTitle>
            <CardDescription>Invite and manage users in your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <InviteUserForm />

            <div className="rounded-md border">
              <div className="p-4 bg-muted/50 font-medium text-sm grid grid-cols-4 border-b">
                <div className="col-span-2">User</div>
                <div>Role</div>
                <div>Status</div>
              </div>
              {org.users?.map((u: any) => (
                <div key={u.id} className="p-4 text-sm grid grid-cols-4 items-center border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <div className="col-span-2 font-medium">{u.name} <span className="text-muted-foreground ml-1 font-normal">({u.email})</span></div>
                  <div><Badge variant="secondary">{u.role}</Badge></div>
                  <div><Badge variant="outline">{u.userStatus}</Badge></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
