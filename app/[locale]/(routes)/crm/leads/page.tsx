import { Suspense } from "react";

import CrmTableSkeleton from "@/components/skeletons/crm-table-skeleton";

import Container from "../../components/ui/Container";
import LeadsView from "../components/LeadsView";

import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getLeads } from "@/actions/crm/get-leads";
import { getTranslations } from "next-intl/server";

import { getSession } from "@/lib/auth-server";

const LeadsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const leads = await getLeads();
  const session = await getSession();
  const isUser = session?.user?.role === "user";

  return (
    <Container
      title={t("leads.pageTitle")}
      description={t("leads.pageDescription")}
    >
      <Suspense fallback={<CrmTableSkeleton />}>
        <LeadsView crmData={crmData} data={leads} isUser={isUser} />
      </Suspense>
    </Container>
  );
};

export default LeadsPage;
