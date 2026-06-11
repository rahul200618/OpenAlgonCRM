"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewVerificationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setError("Missing token!");
      setLoading(false);
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          setError(text || "Something went wrong!");
        } else {
          setSuccess("Email verified successfully! You can now log in.");
        }
      })
      .catch((err) => {
        setError("Something went wrong!");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>We are verifying your email address.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {loading && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying your token...</p>
            </div>
          )}

          {!loading && success && (
            <div className="flex flex-col items-center space-y-4 text-green-600">
              <CheckCircle2 className="h-12 w-12" />
              <p className="font-medium text-center">{success}</p>
              <Link href="/en/sign-in">
                <Button className="mt-4">Back to Login</Button>
              </Link>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center space-y-4 text-destructive">
              <XCircle className="h-12 w-12" />
              <p className="font-medium text-center">{error}</p>
              <Link href="/en/sign-in">
                <Button variant="outline" className="mt-4">Back to Login</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
