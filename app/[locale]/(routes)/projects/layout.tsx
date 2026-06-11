import PremiumFeatureGuard from "@/components/PremiumFeatureGuard";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PremiumFeatureGuard featureName="Project Management">
      {children}
    </PremiumFeatureGuard>
  );
}
