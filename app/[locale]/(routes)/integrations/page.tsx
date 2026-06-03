import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar } from "lucide-react";

export default async function IntegrationsPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Google Workspace */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Google Workspace
            </CardTitle>
            <CardDescription>
              Connect Gmail and Google Calendar to sync emails and events automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Connect Google
            </Button>
          </CardContent>
        </Card>

        {/* Microsoft 365 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Microsoft 365
            </CardTitle>
            <CardDescription>
              Connect Outlook and Microsoft Calendar to sync emails and meetings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Connect Microsoft
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
