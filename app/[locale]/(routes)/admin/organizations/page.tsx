import { Suspense } from "react";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getOrganizations } from "@/actions/admin/get-organizations";
import { Building2, Search, MoreHorizontal, AlertCircle, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrgActionMenu } from "./_components/org-action-menu";

export default async function AdminOrganizationsPage() {
  const session = await getSession();
  
  // Protect this route for SUPER_ADMIN or ADMIN only
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    redirect("/");
  }

  const organizations = await getOrganizations();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
        <div className="flex items-center space-x-2">
          <Button>Export Data</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>SaaS Tenants</CardTitle>
          <CardDescription>
            Manage all organizations and companies currently using the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search organizations..."
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Plan</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Users</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Razorpay ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {organizations.map((org: any) => (
                    <tr key={org.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{org.name}</td>
                      <td className="p-4 align-middle capitalize">{org.plan}</td>
                      <td className="p-4 align-middle">
                        {org.status === "active" ? (
                          <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </td>
                      <td className="p-4 align-middle">{org.usersCount}</td>
                      <td className="p-4 align-middle font-mono text-xs text-muted-foreground">
                        {org.razorpayCustomerId || "N/A"}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <OrgActionMenu organization={org} />
                      </td>
                    </tr>
                  ))}
                  {organizations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="h-24 text-center text-muted-foreground">
                        No organizations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
