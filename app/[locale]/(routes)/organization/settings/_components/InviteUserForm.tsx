"use client";

import { useState } from "react";
import { Mail, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInvite } from "@/actions/organization/create-invite";

export function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    setIsLoading(true);
    try {
      const res = await createInvite(email);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.inviteLink) {
        setInviteLink(res.inviteLink);
        toast.success("Invitation generated successfully!");
      }
    } catch (error) {
      toast.error("Failed to generate invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (inviteLink) {
    return (
      <div className="space-y-3 mt-4">
        <p className="text-sm text-muted-foreground font-medium">Share this link with your team member:</p>
        <div className="flex items-center gap-2 max-w-lg">
          <Input value={inviteLink} readOnly className="bg-muted" />
          <Button variant="secondary" onClick={handleCopy} className="shrink-0 gap-2">
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" onClick={() => { setInviteLink(null); setEmail(""); }}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 max-w-md">
      <div className="grid gap-2 flex-1">
        <label className="text-sm font-medium leading-none">Email Address (Optional)</label>
        <Input 
          placeholder="colleague@company.com" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button className="gap-2" onClick={handleInvite} disabled={isLoading}>
        <Mail className="w-4 h-4" />
        {isLoading ? "Generating..." : "Generate Invite Link"}
      </Button>
    </div>
  );
}
