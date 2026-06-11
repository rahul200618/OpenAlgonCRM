import { inngest } from "../../client";
import { prismadb as prisma } from "@/lib/prisma";

export const evaluateWorkflows = inngest.createFunction(
  { id: "evaluate-workflows" },
  { event: "crm/entity.mutated" },
  async ({ event, step }) => {
    const { entityType, entityId, action, userId } = event.data;

    // e.g. "LEAD_CREATED" or "ACCOUNT_UPDATED"
    const triggerString = `${entityType.toUpperCase()}_${action.toUpperCase()}`;

    // 1. Fetch active workflows for this trigger
    const workflows = await step.run("fetch-workflows", async () => {
      // If we had the organization_id in the event, we could filter by it.
      // Since we don't, we might need to fetch the entity to get its organization_id,
      // or we just fetch global workflows for now.
      return await prisma.workflow.findMany({
        where: {
          trigger: triggerString,
          isActive: true,
        },
      });
    });

    if (!workflows || workflows.length === 0) {
      return { message: "No active workflows for trigger", trigger: triggerString };
    }

    // 2. Fetch the entity to evaluate conditions
    const entity = await step.run("fetch-entity", async () => {
      const modelName = `crm_${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s`;
      try {
        const data = await (prisma as any)[modelName]?.findUnique({
          where: { id: entityId },
        });
        return data;
      } catch (e) {
        return null;
      }
    });

    if (!entity) {
      return { error: "Entity not found", entityId };
    }

    let executedCount = 0;

    // 3. Evaluate each workflow
    for (const workflow of workflows) {
      const conditions = (workflow.conditions as any[]) || [];
      const actions = (workflow.actions as any[]) || [];

      // Evaluate conditions (ALL must match)
      let allConditionsMet = true;
      for (const cond of conditions) {
        const { field, operator, value } = cond;
        const entityValue = entity[field];

        switch (operator) {
          case "EQUALS":
            if (entityValue !== value) allConditionsMet = false;
            break;
          case "NOT_EQUALS":
            if (entityValue === value) allConditionsMet = false;
            break;
          case "CONTAINS":
            if (typeof entityValue !== "string" || !entityValue.includes(value)) allConditionsMet = false;
            break;
          case "IS_NOT_NULL":
            if (entityValue === null || entityValue === undefined) allConditionsMet = false;
            break;
        }
      }

      if (allConditionsMet) {
        // Execute actions
        for (const act of actions) {
          await step.run(`execute-action-${workflow.id}-${act.type}`, async () => {
            if (act.type === "CREATE_TASK") {
              await prisma.tasks.create({
                data: {
                  title: act.payload.title || `Automated Task for ${entityType}`,
                  content: act.payload.content || "",
                  taskStatus: "ACTIVE",
                  priority: "MEDIUM",
                  user: userId ? { connect: { id: userId } } : undefined,
                  organization: entity.organization_id ? { connect: { id: entity.organization_id } } : undefined,
                },
              });
            } else if (act.type === "SEND_EMAIL") {
              // TODO: Implement email sending action
            }
          });
        }
        executedCount++;
      }
    }

    return { success: true, evaluated: workflows.length, executed: executedCount };
  }
);
