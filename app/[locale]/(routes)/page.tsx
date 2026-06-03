import { Suspense } from "react";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import {
  CoinsIcon,
  Contact,
  DollarSignIcon,
  FilePenLine,
  FileText,
  FolderKanban,
  HeartHandshakeIcon,
  LandmarkIcon,
  Megaphone,
  Target,
  UserIcon,
  ListTodo,
  Files,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";

import Container from "./components/ui/Container";
import LoadingBox from "./components/dasboard/loading-box";
import StorageQuota from "./components/dasboard/storage-quota";

import {
  getTasksCount,
  getUsersTasksCount,
} from "@/actions/dashboard/get-tasks-count";
import { getInvoicesCount } from "@/actions/dashboard/get-invoices-count";
import { getCampaignsCount } from "@/actions/dashboard/get-campaigns-count";
import { getTargetsCount } from "@/actions/dashboard/get-targets-count";
import { getLeadsCount } from "@/actions/dashboard/get-leads-count";
import { getBoardsCount } from "@/actions/dashboard/get-boards-count";
import { getStorageSize } from "@/actions/documents/get-storage-size";
import { getContactCount } from "@/actions/dashboard/get-contacts-count";
import { getAccountsCount } from "@/actions/dashboard/get-accounts-count";
import { getContractsCount } from "@/actions/dashboard/get-contracts-count";
import { getDocumentsCount } from "@/actions/dashboard/get-documents-count";
import { getActiveUsersCount } from "@/actions/dashboard/get-active-users-count";
import { getOpportunitiesCount } from "@/actions/dashboard/get-opportunities-count";
import { getExpectedRevenue } from "@/actions/crm/opportunity/get-expected-revenue";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { getDefaultCurrency, formatCurrency as formatCurrencyUtil } from "@/lib/currency";
import { Decimal } from "@prisma/client/runtime/client";
import { getLeadAnalytics } from "@/actions/dashboard/get-lead-analytics";
import { DashboardKpis } from "./components/DashboardKpis";

const DashboardPage = async () => {
  const session = await getSession();

  if (!session) return null;

  if (session.organization_id) {
    const org = await prismadb.organization.findUnique({
      where: { id: session.organization_id }
    });
    if (org?.name.endsWith("'s Workspace")) {
      const { redirect } = await import("next/navigation");
      redirect("/onboarding");
    }
  }

  const userId = session?.user?.id;

  const cookieStore = await cookies();
  const defaultCurrency = await getDefaultCurrency();
  const displayCurrency = cookieStore.get("display_currency")?.value || defaultCurrency;

  //Get user language
  const lang = session?.user?.userLanguage;

  //Fetch translations from dictionary
  const dict = await getTranslations("DashboardPage");

  let leads = 0;
  let tasks = 0;
  let invoices = 0;
  let campaigns = 0;
  let targets = 0;
  let storage = 0;
  let projects = 0;
  let contacts = 0;
  let contracts = 0;
  let users = 0;
  let accounts = 0;
  let revenue = 0;
  let documents = 0;
  let opportunities = 0;
  let usersTasks = 0;
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
    [
      leads,
      tasks,
      invoices,
      campaigns,
      targets,
      storage,
      projects,
      contacts,
      contracts,
      users,
      accounts,
      revenue,
      documents,
      opportunities,
      usersTasks,
      leadAnalytics,
    ] = await Promise.all([
      getLeadsCount(),
      getTasksCount(),
      getInvoicesCount(),
      getCampaignsCount(),
      getTargetsCount(),
      getStorageSize(),
      getBoardsCount(),
      getContactCount(),
      getContractsCount(),
      getActiveUsersCount(),
      getAccountsCount(),
      getExpectedRevenue(displayCurrency),
      getDocumentsCount(),
      getOpportunitiesCount(),
      getUsersTasksCount(userId),
      getLeadAnalytics(session.user.organization_id ?? undefined),
    ]);
  } catch (error) {
    console.warn("[DashboardPage] Database is offline, loading fallback default metrics:", error);
    isDbOffline = true;
  }

  return (
    <Container
      title={dict("containerTitle")}
      description={
        "Welcome to OpenAlgon CRM cockpit, here you can see your company overview"
      }
    >
      {isDbOffline && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Database Offline</span>
          </div>
          <p className="text-muted-foreground text-xs">
            Could not connect to the local PostgreSQL database server (ECONNREFUSED). Please make sure your database server is running and `DATABASE_URL` in `.env` is configured correctly, then run `pnpm prisma migrate dev` to initialize your schema.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue cards */}
        <Suspense fallback={<LoadingBox />}>
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{dict("totalRevenue")}</p>
              <span className="icon-bg-indigo p-2 rounded-lg">
                <DollarSignIcon className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>
        </Suspense>
        <Suspense fallback={<LoadingBox />}>
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{dict("expectedRevenue")}</p>
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
        <DashboardCard href="/admin/users"    title={dict("activeUsers")}    IconComponent={UserIcon}          content={users}       colorClass="icon-bg-indigo" />
        <DashboardCard href="/invoices"        title={dict("invoices")}       IconComponent={FileText}          content={invoices}    colorClass="icon-bg-blue" />
        <DashboardCard href="/campaigns"       title={dict("campaigns")}      IconComponent={Megaphone}         content={campaigns}   colorClass="icon-bg-violet" />
        <DashboardCard href="/crm/targets"     title={dict("targets")}        IconComponent={Target}            content={targets}     colorClass="icon-bg-rose" />
        <DashboardCard href="/crm/accounts"    title={dict("accounts")}       IconComponent={LandmarkIcon}      content={accounts}    colorClass="icon-bg-amber" />
        <DashboardCard href="/crm/opportunities" title={dict("opportunities")} IconComponent={HeartHandshakeIcon} content={opportunities} colorClass="icon-bg-emerald" />
        <DashboardCard href="/crm/contacts"    title={dict("contacts")}       IconComponent={Contact}           content={contacts}    colorClass="icon-bg-blue" />
        <DashboardCard href="/crm/leads"       title={dict("leads")}          IconComponent={CoinsIcon}         content={leads}       colorClass="icon-bg-indigo" />
        <DashboardCard href="/crm/contracts"   title={dict("contracts")}      IconComponent={FilePenLine}       content={contracts}   colorClass="icon-bg-amber" />
        <DashboardCard href="/projects"         title={dict("projects")}       IconComponent={FolderKanban}      content={projects}    colorClass="icon-bg-violet" />
        <DashboardCard href="/projects/tasks"   title={dict("tasks")}          IconComponent={ListTodo}          content={tasks}       colorClass="icon-bg-rose" />
        <DashboardCard href={`/projects/tasks/${userId}`} title={dict("myTasks")} IconComponent={CheckSquare} content={usersTasks} colorClass="icon-bg-emerald" />
        <DashboardCard href="/documents"        title={dict("documents")}      IconComponent={Files}             content={documents}   colorClass="icon-bg-blue" />

        <StorageQuota actual={storage} title={dict("storage")} />
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
