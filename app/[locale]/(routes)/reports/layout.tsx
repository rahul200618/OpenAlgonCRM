import PremiumFeatureGuard from "@/components/PremiumFeatureGuard";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PremiumFeatureGuard featureName="Advanced Reports">
      {children}
    </PremiumFeatureGuard>
  );
}
