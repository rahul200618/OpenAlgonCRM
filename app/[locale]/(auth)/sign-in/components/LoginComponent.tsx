"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Icons } from "@/components/ui/icons";
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
import { MailIcon, KeyIcon, UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // New tenant fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [phone, setPhone] = useState("");
  
  const router = useRouter();

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      toast.error("Something went wrong with Google sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentEmail = formData.get("email") as string || email;
    const currentPassword = formData.get("password") as string || password;

    if (!currentEmail || !currentPassword) {
      toast.error("Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: currentEmail,
        password: currentPassword,
      });
      if (res?.error) {
        toast.error("Invalid email or password.");
      } else {
        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentName = formData.get("name") as string || name;
    const currentEmail = formData.get("email") as string || email;
    const currentPassword = formData.get("password") as string || password;
    
    const currentCompany = formData.get("companyName") as string || companyName;
    const currentIndustry = formData.get("industry") as string || industry;
    const currentCompanySize = formData.get("companySize") as string || companySize;
    const currentPhone = formData.get("phone") as string || phone;

    if (!currentName || !currentEmail || !currentPassword || !currentCompany || !currentIndustry || !currentCompanySize) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: currentName, 
          email: currentEmail, 
          password: currentPassword,
          companyName: currentCompany,
          industry: currentIndustry,
          companySize: currentCompanySize,
          phone: currentPhone
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create account.");
      }
      toast.success("Account created! Please check your email (or terminal) to verify your account before logging in.");
      // Clear the form or switch tabs to sign in
      // Do not auto-login because the user must verify their email first
    } catch (error: any) {
      toast.error(error.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            OpenAlgon CRM
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Your workspace awaits.</p>
        </div>

        <Card className="shadow-2xl w-full glass-card border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome</CardTitle>
            <CardDescription>Login or create an account</CardDescription>
          </CardHeader>
          
          <CardContent className="grid gap-6 pt-4">
            {/* Google */}
            <Button
              variant="outline"
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="w-full h-12 relative overflow-hidden border-white/10 bg-background/50 hover:bg-background/80 transition-all font-medium text-md"
            >
              <Icons.google className="mr-3 h-5 w-5" />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border/50"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Or
              </span>
              <div className="flex-grow border-t border-border/50"></div>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-muted/50 rounded-lg">
                <TabsTrigger value="signin" className="rounded-md transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-md transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="font-medium text-sm ml-1">Email address</Label>
                    <div className="relative group">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="signin-password" className="font-medium text-sm">Password</Label>
                      <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline transition-all">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative group">
                      <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-md font-semibold mt-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="font-medium text-sm ml-1">Full Name</Label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-company" className="font-medium text-sm ml-1">Company Name</Label>
                    <div className="relative group">
                      <Input
                        id="signup-company"
                        name="companyName"
                        type="text"
                        placeholder="Acme Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={isLoading}
                        className="h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-industry" className="font-medium text-sm ml-1">Industry</Label>
                      <Input
                        id="signup-industry"
                        name="industry"
                        type="text"
                        placeholder="Software"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        disabled={isLoading}
                        className="h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-size" className="font-medium text-sm ml-1">Company Size</Label>
                      <Input
                        id="signup-size"
                        name="companySize"
                        type="text"
                        placeholder="1-10"
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        disabled={isLoading}
                        className="h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="font-medium text-sm ml-1">Phone Number (Optional)</Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                      className="h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-medium text-sm ml-1">Email address</Label>
                    <div className="relative group">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-medium text-sm ml-1">Password</Label>
                    <div className="relative group">
                      <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-12 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all"
                        minLength={8}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground ml-1 mt-1">Must be at least 8 characters</p>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-md font-semibold mt-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
