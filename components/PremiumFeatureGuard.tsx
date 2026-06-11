import { checkSubscription } from "@/lib/subscription";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  featureName: string;
}

export default async function PremiumFeatureGuard({
  children,
  featureName,
}: PremiumFeatureGuardProps) {
  const hasAccess = await checkSubscription();

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="bg-muted/50 p-6 rounded-full mb-6">
        <Lock className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-3xl font-bold mb-3">{featureName} is a Premium Feature</h2>
      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        Your free trial has expired or this feature requires an active subscription. Upgrade your plan to unlock {featureName} and other advanced CRM tools.
      </p>
      <Link href="/pricing">
        <Button size="lg" className="font-semibold">
          Upgrade to Premium
        </Button>
      </Link>
    </div>
  );
}
