"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyIcon, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!token) {
      toast.error("Missing reset token.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to reset password.");
      }
      setIsSuccess(true);
      toast.success("Password reset successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4 py-8">
        <h3 className="text-xl font-medium text-destructive">Invalid Link</h3>
        <p className="text-muted-foreground">
          This password reset link is invalid or missing the required token.
        </p>
        <div className="pt-4">
          <Link href="/forgot-password">
            <Button variant="outline">Request a new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-medium">Password updated!</h3>
        <p className="text-muted-foreground mb-8">
          Your password has been changed successfully.
        </p>
        <Link href="/sign-in" className="block mt-8">
          <Button className="w-full h-12 text-md">Continue to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className="font-medium text-sm">New Password</Label>
        <div className="relative group">
          <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="pl-10 h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="font-medium text-sm">Confirm Password</Label>
        <div className="relative group">
          <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="pl-10 h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
            required
            minLength={8}
          />
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading || !password || !confirmPassword}
        className="w-full h-12 text-md font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? "Resetting..." : "Set New Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      
      <Card className="shadow-2xl w-full max-w-md mx-auto glass-card relative z-10 border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-base mt-2">
            Create a new, strong password for your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
