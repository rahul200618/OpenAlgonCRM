"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MailIcon, PhoneIcon } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "input" | "otp";
type AuthTab = "email" | "phone";

// Indian country code prefix selector — extend for other countries as needed
const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", label: "IN" },
  { code: "+1",  flag: "🇺🇸", label: "US" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+65", flag: "🇸🇬", label: "SG" },
];

export function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [activeTab, setActiveTab] = useState<AuthTab>("email");

  // Email state
  const [email, setEmail] = useState("");

  // Phone state
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Shared OTP state
  const [otp, setOtp] = useState("");

  const supabase = createClient();

  // ─── Google OAuth ──────────────────────────────────────────────────────────

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message || "Something went wrong with Google sign-in.");
      }
    } catch {
      toast.error("Something went wrong with Google sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Email OTP ────────────────────────────────────────────────────────────

  const sendEmailOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) {
        toast.error(error.message || "Failed to send verification code.");
        return;
      }
      setStep("otp");
      toast.success("Verification code sent to your email.");
    } catch {
      toast.error("Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) {
        toast.error(error.message || "Invalid or expired code.");
        return;
      }
      toast.success("Login successful.");
      window.location.href = "/";
    } catch {
      toast.error("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Phone OTP ────────────────────────────────────────────────────────────

  const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;

  const sendPhoneOtp = async () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });
      if (error) {
        toast.error(error.message || "Failed to send SMS code.");
        return;
      }
      setStep("otp");
      toast.success(`OTP sent to ${fullPhone}`);
    } catch {
      toast.error("Failed to send SMS code.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: "sms",
      });
      if (error) {
        toast.error(error.message || "Invalid or expired code.");
        return;
      }
      toast.success("Login successful.");
      window.location.href = "/";
    } catch {
      toast.error("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Shared reset ─────────────────────────────────────────────────────────

  const handleBack = () => {
    setStep("input");
    setOtp("");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as AuthTab);
    setStep("input");
    setOtp("");
  };

  // ─── OTP step (shared for email & phone) ─────────────────────────────────

  if (step === "otp") {
    const isPhone = activeTab === "phone";
    const destination = isPhone ? fullPhone : email;
    const handleVerify = isPhone ? verifyPhoneOtp : verifyEmailOtp;

    return (
      <Card className="shadow-lg my-5">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Enter your code</CardTitle>
          <CardDescription>
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-foreground">{destination}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-center py-2">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            disabled={isLoading || otp.length !== 6}
            className="w-full"
          >
            {isLoading ? "Verifying..." : "Verify & Sign In"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={isLoading}
            className="w-full"
          >
            ← Use a different {isPhone ? "number" : "email"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Didn&apos;t receive it? Check spam, or{" "}
            <button
              className="underline hover:text-foreground transition-colors"
              onClick={handleBack}
              disabled={isLoading}
            >
              try again
            </button>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  // ─── Input step ───────────────────────────────────────────────────────────

  return (
    <Card className="shadow-lg my-5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in to OrvixCRM</CardTitle>
        <CardDescription>Choose your preferred sign-in method</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">

        {/* Google */}
        <Button
          variant="outline"
          onClick={loginWithGoogle}
          disabled={isLoading}
          className="w-full"
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              or continue with
            </span>
          </div>
        </div>

        {/* Email / Phone tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-1.5">
              <MailIcon className="h-3.5 w-3.5" />
              Email OTP
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-1.5">
              <PhoneIcon className="h-3.5 w-3.5" />
              Phone OTP
            </TabsTrigger>
          </TabsList>

          {/* ── Email Tab ── */}
          <TabsContent value="email" className="mt-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === "Enter" && sendEmailOtp()}
                />
              </div>
              <Button
                onClick={sendEmailOtp}
                disabled={isLoading || !email}
                className="w-full"
              >
                <MailIcon className="mr-2 h-4 w-4" />
                {isLoading ? "Sending..." : "Send verification code"}
              </Button>
            </div>
          </TabsContent>

          {/* ── Phone Tab ── */}
          <TabsContent value="phone" className="mt-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <div className="flex gap-2">
                  {/* Country code picker */}
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={isLoading}
                    className="flex h-9 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-[90px] shrink-0"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === "Enter" && sendPhoneOtp()}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  A one-time SMS code will be sent to this number.
                </p>
              </div>
              <Button
                onClick={sendPhoneOtp}
                disabled={isLoading || phoneNumber.replace(/\D/g, "").length < 7}
                className="w-full"
              >
                <PhoneIcon className="mr-2 h-4 w-4" />
                {isLoading ? "Sending SMS..." : "Send OTP via SMS"}
              </Button>
            </div>

            {/* India DLT notice */}
            <p className="text-xs text-muted-foreground mt-3 p-2 bg-muted/50 rounded-md">
              🇮🇳 For Indian numbers, ensure your Supabase SMS provider is
              DLT-registered per TRAI guidelines.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
