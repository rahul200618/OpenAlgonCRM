import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.organization_id) {
    redirect("/sign-in");
  }

  const organization = await prismadb.organization.findUnique({
    where: { id: session.user.organization_id }
  });

  const dbUser = await prismadb.users.findUnique({
    where: { id: session.user.id }
  });

  // Server action to update organization name and complete onboarding
  const completeOnboarding = async (formData: FormData) => {
    "use server";
    const session = await getSession();
    if (!session || !session.user.organization_id) return;
    
    const companyName = formData.get("companyName") as string;
    const industry = formData.get("industry") as string;
    const companySize = formData.get("companySize") as string;
    const phone = formData.get("phone") as string;

    if (companyName) {
      await prismadb.organization.update({
        where: { id: session.user.organization_id },
        data: { 
          name: companyName,
          industry: industry || null,
          companySize: companySize || null
        }
      });
    }

    if (phone) {
      await prismadb.users.update({
        where: { id: session.user.id },
        data: { phone }
      });
    }

    // Since this is the organization creator, make sure they are an admin.
    // Auth.ts sets the first user to admin, but if this is a separate signup that creates an org, enforce admin here too.
    await prismadb.users.update({
      where: { id: session.user.id },
      data: { role: "admin", userStatus: "ACTIVE" }
    });

    revalidatePath("/");
    redirect("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12">
      <Card className="w-[550px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to OpenAlgon CRM!</CardTitle>
          <CardDescription>Let&apos;s set up your workspace and profile before we get started.</CardDescription>
        </CardHeader>
        <form action={completeOnboarding}>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Your Workspace</h3>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input 
                  id="companyName" 
                  name="companyName" 
                  defaultValue={organization?.name || ""} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    name="industry" 
                    placeholder="e.g. Software, Real Estate" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <select 
                    id="companySize" 
                    name="companySize"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select size...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201+">201+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Your Profile</h3>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel"
                  placeholder="+1 (555) 000-0000" 
                  defaultValue={dbUser?.phone || ""}
                />
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" size="lg" type="submit">Complete Setup</Button>
            <p className="text-xs text-center text-muted-foreground">
              By completing setup, you will be assigned as the Administrator for this workspace. 
              Subscription plans can be configured later.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
