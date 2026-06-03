import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const StatCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-4 w-24 bg-muted" />
      <Skeleton className="h-8 w-8 rounded-lg bg-muted" />
    </div>
    <Skeleton className="h-8 w-16 bg-muted" />
  </div>
);

const StorageCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-4 w-24 bg-muted" />
      <Skeleton className="h-8 w-8 rounded-lg bg-muted" />
    </div>
    <Skeleton className="h-8 w-24 bg-muted mb-4" />
    <Skeleton className="h-2 w-full bg-muted" />
  </div>
);

const DashboardLoading = () => {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 h-full overflow-hidden">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <Separator />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StorageCardSkeleton />
      </div>
    </div>
  );
};

export default DashboardLoading;
