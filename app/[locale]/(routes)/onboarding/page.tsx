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

  // Server action to update organization name and complete onboarding
  const completeOnboarding = async (formData: FormData) => {
    "use server";
    const session = await getSession();
    if (!session || !session.user.organization_id) return;
    
    const companyName = formData.get("companyName") as string;
    if (companyName) {
      await prismadb.organization.update({
        where: { id: session.user.organization_id },
        data: { name: companyName }
      });
    }

    // Mark user as onboarded in a real app, for now just redirect
    revalidatePath("/");
    redirect("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Welcome to OpenAlgon CRM!</CardTitle>
          <CardDescription>Let&apos;s set up your workspace before we get started.</CardDescription>
        </CardHeader>
        <form action={completeOnboarding}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                name="companyName" 
                defaultValue={organization?.name || ""} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input 
                id="industry" 
                name="industry" 
                placeholder="e.g. Software, Real Estate, Consulting" 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">Complete Setup</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
