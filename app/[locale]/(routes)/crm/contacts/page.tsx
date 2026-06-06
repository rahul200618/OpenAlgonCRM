import { Suspense } from "react";

import CrmTableSkeleton from "@/components/skeletons/crm-table-skeleton";

import Container from "../../components/ui/Container";
import ContactsView from "../components/ContactsView";
import { getContacts } from "@/actions/crm/get-contacts";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getTranslations } from "next-intl/server";

import { getSession } from "@/lib/auth-server";

const AccountsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const contacts = await getContacts();
  const session = await getSession();
  const isUser = session?.user?.role === "user";

  return (
    <Container
      title={t("contacts.pageTitle")}
      description={t("contacts.pageDescription")}
    >
      <Suspense fallback={<CrmTableSkeleton />}>
        <ContactsView crmData={crmData} data={contacts} isUser={isUser} />
      </Suspense>
    </Container>
  );
};

export default AccountsPage;
