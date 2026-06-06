import { Suspense } from "react";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import {
  CoinsIcon,
  Contact,
  DollarSignIcon,
  HeartHandshakeIcon,
  LandmarkIcon,
  UserIcon,
  CheckSquare,
  Database
} from "lucide-react";
import Link from "next/link";

import Container from "./components/ui/Container";
import LoadingBox from "./components/dasboard/loading-box";
import StorageQuota from "./components/dasboard/storage-quota";

import { getStorageSize } from "@/actions/documents/get-storage-size";
import { getActiveUsersCount } from "@/actions/dashboard/get-active-users-count";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { getDefaultCurrency, formatCurrency as formatCurrencyUtil } from "@/lib/currency";
import { Decimal } from "@prisma/client/runtime/client";
import { DashboardKpis } from "./components/DashboardKpis";

import { buildCrmFilter, buildTaskFilter } from "@/lib/dashboard-filters";

const DashboardPage = async () => {
  const session = await getSession();

  if (!session) return null;

  if (session.user.organization_id) {
    const org = await prismadb.organization.findUnique({
      where: { id: session.user.organization_id }
    });
    if (org?.name.endsWith("'s Workspace")) {
      const { redirect } = await import("next/navigation");
      redirect("/onboarding");
    }
  }

  const appUser = session.user as any;
  const cookieStore = await cookies();
  const defaultCurrency = await getDefaultCurrency();
  const displayCurrency = cookieStore.get("display_currency")?.value || defaultCurrency;
  const dict = await getTranslations("DashboardPage");

  const crmFilter = buildCrmFilter(appUser);
  const taskFilter = buildTaskFilter(appUser);
  const isAdminOrDev = appUser.role === "admin" || appUser.role === "developer";
  const isManager = appUser.role === "manager";
  const isUser = appUser.role === "user";

  let leads = 0;
  let contacts = 0;
  let accounts = 0;
  let opportunities = 0;
  let revenue = 0;
  let myTasks = 0;
  
  let users = 0;
  let storage = 0;

  let leadAnalytics: any = {
    totalLeads: 0,
    activeCount: 0,
    convertedCount: 0,
    lostCount: 0,
    conversionRate: 0,
    channelChartData: [],
    leaderboard: [],
    funnelData: [],
    avgResponseTimeHours: 0,
  };
  
  let isDbOffline = false;

  try {
    // 1. Fetch CRM Metrics using filters
    const [leadsCount, contactsCount, accountsCount, opps, taskCount] = await Promise.all([
      prismadb.crm_Leads.count({ where: crmFilter }),
      prismadb.crm_Contacts.count({ where: crmFilter }),
      prismadb.crm_Accounts.count({ where: crmFilter }),
      prismadb.crm_Opportunities.findMany({
        where: { ...crmFilter, status: "ACTIVE" },
        select: { budget: true, currency: true }
      }),
      prismadb.tasks.count({ where: taskFilter })
    ]);

    leads = leadsCount;
    contacts = contactsCount;
    accounts = accountsCount;
    opportunities = opps.length;
    myTasks = taskCount;

    // Calculate expected revenue based on filtered opportunities
    const { getExchangeRates, convertAmount } = await import("@/lib/currency");
    const rates = await getExchangeRates();
    let totalRev = new Decimal(0);
    for (const opp of opps) {
      const budget = new Decimal(opp.budget?.toString() ?? "0");
      const from = opp.currency || displayCurrency;
      const converted = convertAmount(budget, from, displayCurrency, rates);
      totalRev = totalRev.add(converted ?? budget);
    }
    revenue = totalRev.toNumber();

    // 2. Fetch Admin Metrics
    if (isAdminOrDev) {
      [users, storage] = await Promise.all([
        getActiveUsersCount(),
        getStorageSize(),
      ]);
    }

    // 3. Fetch Analytics (TODO: update getLeadAnalytics to accept appUser instead of just org_id)
    const { getLeadAnalytics } = await import("@/actions/dashboard/get-lead-analytics");
    leadAnalytics = await getLeadAnalytics(appUser);

  } catch (error) {
    console.warn("[DashboardPage] Database error:", error);
    isDbOffline = true;
  }

  const roleLabels: Record<string, string> = {
    developer: "Developer Dashboard",
    admin: "Admin Dashboard",
    manager: "Team Manager Dashboard",
    user: "My Dashboard"
  };

  return (
    <Container
      title={roleLabels[appUser.role] || dict("containerTitle")}
      description={
        appUser.role === "user" 
          ? "Welcome! Here is an overview of your assigned pipeline and tasks." 
          : appUser.role === "manager" 
            ? "Welcome! Here is an overview of your team's pipeline and tasks."
            : "Welcome to OpenAlgon CRM cockpit, here you can see the global overview."
      }
    >
      {isDbOffline && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Database Offline</span>
          </div>
          <p className="text-muted-foreground text-xs">
            Could not connect to the local PostgreSQL database server (ECONNREFUSED).
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Revenue cards */}
        <Suspense fallback={<LoadingBox />}>
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">
                {isAdminOrDev ? "Global Expected Revenue" : isManager ? "Team Expected Revenue" : "My Expected Revenue"}
              </p>
              <span className="icon-bg-emerald p-2 rounded-lg">
                <DollarSignIcon className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrencyUtil(new Decimal(revenue), displayCurrency)}
            </p>
          </div>
        </Suspense>

        {/* Module stat cards */}
        <DashboardCard href="/crm/opportunities" title={isAdminOrDev ? dict("opportunities") : isManager ? "Team Opportunities" : "My Opportunities"} IconComponent={HeartHandshakeIcon} content={opportunities} colorClass="icon-bg-emerald" />
        <DashboardCard href="/crm/leads"       title={isAdminOrDev ? dict("leads") : isManager ? "Team Leads" : "My Leads"}          IconComponent={CoinsIcon}         content={leads}       colorClass="icon-bg-indigo" />
        
        {/* Only Managers and Admins need quick access to Contacts and Accounts aggregate counts */}
        {!isUser && (
          <>
            <DashboardCard href="/crm/contacts"    title={isAdminOrDev ? dict("contacts") : "Team Contacts"}       IconComponent={Contact}           content={contacts}    colorClass="icon-bg-blue" />
            <DashboardCard href="/crm/accounts"    title={isAdminOrDev ? dict("accounts") : "Team Accounts"}       IconComponent={LandmarkIcon}      content={accounts}    colorClass="icon-bg-amber" />
          </>
        )}
        
        <DashboardCard href={`/projects/tasks/${appUser.id}`} title={isAdminOrDev ? "Total Tasks" : isManager ? "Team Tasks" : dict("myTasks")} IconComponent={CheckSquare} content={myTasks} colorClass="icon-bg-rose" />

        {/* Admin Only Cards */}
        {isAdminOrDev && (
          <>
            <DashboardCard href="/admin/users"    title={dict("activeUsers")}    IconComponent={UserIcon}          content={users}       colorClass="icon-bg-indigo" />
            <StorageQuota actual={storage} title={dict("storage")} />
          </>
        )}
      </div>

      <DashboardKpis data={leadAnalytics} />
    </Container>
  );
};

export default DashboardPage;

const DashboardCard = ({
  href,
  title,
  IconComponent,
  content,
  colorClass = "icon-bg-indigo",
}: {
  href?: string;
  title: string;
  IconComponent: any;
  content: number;
  colorClass?: string;
}) => (
  <Link href={href || "#"} className="block group">
    <Suspense fallback={<LoadingBox />}>
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <span className={`${colorClass} p-2 rounded-lg`}>
            <IconComponent className="w-4 h-4" />
          </span>
        </div>
        <p className="text-2xl font-bold text-foreground">{content}</p>
      </div>
    </Suspense>
  </Link>
);
