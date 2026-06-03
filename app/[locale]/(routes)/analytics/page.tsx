import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getLeadAnalytics } from "@/actions/dashboard/get-lead-analytics";
import AnalyticsCharts from "./_components/AnalyticsCharts";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session || !session.user || !session.organization_id) {
    redirect("/sign-in");
  }

  const data = await getLeadAnalytics(session.organization_id);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h2>
      </div>
      <AnalyticsCharts data={data} />
    </div>
  );
}
