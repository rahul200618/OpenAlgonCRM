"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { toggleFeatureFlag } from "@/actions/feature-flags/toggle-flag";
import { Loader2, Settings2, Zap } from "lucide-react";

type FeatureFlag = {
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
};

interface FeatureFlagsDashboardProps {
  flags: FeatureFlag[];
}

const FLAG_ICONS: Record<string, string> = {
  module_projects: "📋",
  module_campaigns: "📧",
  module_employees: "👥",
  module_documents: "📁",
  module_emails: "✉️",
  module_invoices: "🧾",
  module_reports: "📊",
  module_mcp_server: "🤖",
  module_ai_enrichment: "🧠",
  module_followups: "🔔",
  module_webhooks: "🔗",
  module_assignment_engine: "⚡",
};

export function FeatureFlagsDashboard({ flags }: FeatureFlagsDashboardProps) {
  const [flagStates, setFlagStates] = useState<Record<string, boolean>>(
    Object.fromEntries(flags.map((f) => [f.key, f.enabled]))
  );
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  const handleToggle = (key: string, newValue: boolean) => {
    setPending((p) => ({ ...p, [key]: true }));
    setFlagStates((s) => ({ ...s, [key]: newValue }));

    startTransition(async () => {
      try {
        await toggleFeatureFlag(key, newValue);
        toast.success(`${newValue ? "Enabled" : "Disabled"} successfully`);
      } catch (err) {
        // Revert on error
        setFlagStates((s) => ({ ...s, [key]: !newValue }));
        toast.error("Failed to update feature flag");
      } finally {
        setPending((p) => ({ ...p, [key]: false }));
      }
    });
  };

  const enabledCount = Object.values(flagStates).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Modules</p>
                <p className="text-2xl font-bold">{enabledCount} / {flags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">Live</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flags.map((flag) => {
          const isEnabled = flagStates[flag.key] ?? flag.enabled;
          const isLoading = pending[flag.key];
          const icon = FLAG_ICONS[flag.key] ?? "🔧";

          return (
            <Card
              key={flag.key}
              className={`transition-all duration-200 ${
                isEnabled
                  ? "border-primary/20 shadow-sm"
                  : "opacity-60 border-dashed"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <CardTitle className="text-base leading-tight">
                      {flag.label}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isLoading && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                    <Switch
                      id={`flag-${flag.key}`}
                      checked={isEnabled}
                      onCheckedChange={(val) => handleToggle(flag.key, val)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">
                  {flag.description}
                </CardDescription>
                <div className="mt-3">
                  <Badge
                    variant={isEnabled ? "default" : "outline"}
                    className="text-xs"
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Changes are applied immediately. Navigation items will update on the next page refresh.
        Feature flags control nav visibility only — the underlying code remains deployed.
      </p>
    </div>
  );
}
