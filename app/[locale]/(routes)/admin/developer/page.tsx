import { redirect } from "next/navigation";
import { requireUser, isAdmin } from "@/lib/auth";
import { prismadb as prisma } from "@/lib/prisma";
import { FeatureFlagsDashboard } from "./components/FeatureFlagsDashboard";

export const dynamic = "force-dynamic";

const DEFAULT_FLAGS = [
  {
    key: "module_projects",
    label: "Project Management (Kanban)",
    description: "Kanban boards and task management for team projects.",
    enabled: true,
  },
  {
    key: "module_campaigns",
    label: "Email Campaigns",
    description: "Email marketing campaigns, templates, and target lists.",
    enabled: true,
  },
  {
    key: "module_employees",
    label: "Employees / HR",
    description: "Employee management and HR records.",
    enabled: false,
  },
  {
    key: "module_documents",
    label: "Document Storage",
    description: "Document upload, management, and version control.",
    enabled: true,
  },
  {
    key: "module_emails",
    label: "Email Client",
    description: "Built-in IMAP/SMTP email client.",
    enabled: true,
  },
  {
    key: "module_invoices",
    label: "Invoices",
    description: "Full invoicing workflow with PDF export.",
    enabled: true,
  },
  {
    key: "module_reports",
    label: "Reports & Analytics",
    description: "Sales reports and data export.",
    enabled: true,
  },
  {
    key: "module_mcp_server",
    label: "MCP Server (AI Agents)",
    description: "Model Context Protocol server for AI agent access.",
    enabled: false,
  },
  {
    key: "module_ai_enrichment",
    label: "AI Lead Enrichment",
    description: "E2B sandboxed browser agent for contact/lead enrichment.",
    enabled: false,
  },
  {
    key: "module_followups",
    label: "Follow-up Scheduler",
    description: "Schedule and track lead follow-up reminders.",
    enabled: true,
  },
  {
    key: "module_webhooks",
    label: "Webhook Endpoints",
    description: "Multi-channel lead capture webhooks (Meta, Google, Website, Custom).",
    enabled: true,
  },
  {
    key: "module_assignment_engine",
    label: "Auto Lead Assignment",
    description: "Round-robin, weighted, and team-based automatic lead assignment.",
    enabled: true,
  },
];

export default async function DeveloperPage() {
  const user = await requireUser();
  const admin = await isAdmin();

  if (!admin) {
    redirect("/en");
  }

  // Seed missing flags on first visit
  for (const flag of DEFAULT_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      create: flag,
      update: {},
    });
  }

  const flags = await prisma.featureFlag.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Developer Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Control which modules and features are visible in OPENALGON CRM. Changes take effect on next page load.
        </p>
      </div>
      <FeatureFlagsDashboard flags={flags} />
    </div>
  );
}
