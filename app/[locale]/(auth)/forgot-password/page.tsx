"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MailIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Something went wrong. Please try again.");
      }
      setIsSubmitted(true);
      toast.success("If an account exists, a reset link was sent.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      
      <Card className="shadow-2xl w-full max-w-md mx-auto glass-card relative z-10 border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Forgot Password</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-sm">Email address</Label>
                <div className="relative group">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-12 text-md font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? "Sending link..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <MailIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Check your inbox</h3>
              <p className="text-muted-foreground">
                We've sent a password reset link to <br/><span className="text-foreground font-medium">{email}</span>
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="mt-6"
              >
                Try another email
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <Link href="/sign-in" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
