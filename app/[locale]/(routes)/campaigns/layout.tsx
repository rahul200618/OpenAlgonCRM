import PremiumFeatureGuard from "@/components/PremiumFeatureGuard";

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PremiumFeatureGuard featureName="Marketing Campaigns">
      {children}
    </PremiumFeatureGuard>
  );
}
