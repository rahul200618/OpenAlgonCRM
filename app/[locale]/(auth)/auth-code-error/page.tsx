import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const errorDescription = params?.error_description || params?.error || "We encountered a problem while trying to authenticate your account.";

  return (
    <Card className="shadow-lg my-5 w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-destructive">
          Authentication Error
        </CardTitle>
        <CardDescription>
          {errorDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="text-center text-sm text-muted-foreground">
          This could be due to a database error, a missing trigger, or the authentication provider refusing to grant access.
        </div>
        <Button asChild className="w-full">
          <Link href="/sign-in">Return to Sign In</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
