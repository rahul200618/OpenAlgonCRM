import PremiumFeatureGuard from "@/components/PremiumFeatureGuard";

export default function EmailsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PremiumFeatureGuard featureName="Email Campaigns">
      {children}
    </PremiumFeatureGuard>
  );
}
