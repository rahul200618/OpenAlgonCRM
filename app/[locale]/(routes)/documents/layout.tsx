import PremiumFeatureGuard from "@/components/PremiumFeatureGuard";

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PremiumFeatureGuard featureName="Document Management">
      {children}
    </PremiumFeatureGuard>
  );
}
