import PremiumFeatureGuard from "@/components/PremiumFeatureGuard";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PremiumFeatureGuard featureName="Advanced Analytics">
      {children}
    </PremiumFeatureGuard>
  );
}
