import PremiumFeatureGuard from "@/components/PremiumFeatureGuard";

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PremiumFeatureGuard featureName="Invoices & Billing">
      {children}
    </PremiumFeatureGuard>
  );
}
