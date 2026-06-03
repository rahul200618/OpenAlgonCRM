import React from "react";
import { getFollowups } from "@/actions/followups/actions";
import { prismadb as prisma } from "@/lib/prisma";
import Container from "../components/ui/Container";
import { FollowupsClient } from "./components/FollowupsClient";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface RawFollowup {
  id: string;
  leadId: string;
  assignedUser: string;
  followupDate: Date;
  note: string | null;
  status: string;
  createdAt: Date;
  lead: {
    firstName: string | null;
    lastName: string;
    email: string | null;
    phone: string | null;
  } | null;
}

interface RawLead {
  id: string;
  firstName: string | null;
  lastName: string;
  company: string | null;
}

export default async function FollowupsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/en/sign-in");
    throw new Error("Redirecting...");
  }

  // Fetch follow-ups using the server action
  const followupsRaw = (await getFollowups()) as unknown as RawFollowup[];

  // Map to matching client-side props
  const followups = followupsRaw.map((f: RawFollowup) => ({
    id: f.id,
    leadId: f.leadId,
    assignedUser: f.assignedUser,
    followupDate: f.followupDate,
    note: f.note ?? "",
    status: f.status,
    createdAt: f.createdAt,
    leadName: f.lead ? `${f.lead.firstName || ""} ${f.lead.lastName}`.trim() : "Unknown Lead",
    leadEmail: f.lead?.email ?? "",
    leadPhone: f.lead?.phone ?? "",
  }));

  // Fetch leads for the dropdown scheduler
  const orgFilter = session.user.organization_id ? { organization_id: session.user.organization_id } : {};
  const leads = await prisma.crm_Leads.findMany({
    where: {
      deletedAt: null,
      ...orgFilter,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      company: true,
    },
    orderBy: {
      lastName: "asc",
    },
  });

  const leadsList = leads.map((l: RawLead) => ({
    id: l.id,
    name: `${l.firstName || ""} ${l.lastName} ${l.company ? `(${l.company})` : ""}`.trim(),
  }));

  return (
    <Container
      title="Follow-up Scheduler"
      description="Schedule and manage client follow-up calls, emails, and meetings."
    >
      <FollowupsClient initialFollowups={followups} leads={leadsList} />
    </Container>
  );
}
