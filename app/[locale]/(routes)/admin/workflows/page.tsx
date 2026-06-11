import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getWorkflows } from "@/actions/crm/workflows/get-workflows";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns";

export default async function WorkflowsPage() {
  const workflows = await getWorkflows();

  return (
    <Container
      title="Automation Workflows"
      description="Create rules to automate repetitive tasks based on CRM events."
    >
      <DataTable
        columns={columns}
        data={workflows as any}
        search="name"
      />
    </Container>
  );
}
