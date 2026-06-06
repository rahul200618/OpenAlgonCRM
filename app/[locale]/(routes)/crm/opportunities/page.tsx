import { Suspense } from "react";

import CrmTableSkeleton from "@/components/skeletons/crm-table-skeleton";

import Container from "../../components/ui/Container";
import OpportunitiesView from "../components/OpportunitiesView";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getOpportunitiesFull } from "@/actions/crm/get-opportunities-with-includes";
import { getTranslations } from "next-intl/server";
import { serializeDecimalsList } from "@/lib/serialize-decimals";

import { getSession } from "@/lib/auth-server";

const AccountsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const opportunities = serializeDecimalsList(await getOpportunitiesFull());
  const session = await getSession();
  const isUser = session?.user?.role === "user";

  return (
    <Container
      title={t("opportunities.pageTitle")}
      description={t("opportunities.pageDescription")}
    >
      <Suspense fallback={<CrmTableSkeleton />}>
        <OpportunitiesView crmData={crmData} data={opportunities} isUser={isUser} />
      </Suspense>
    </Container>
  );
};

export default AccountsPage;
