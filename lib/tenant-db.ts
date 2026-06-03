import { prismadb } from "@/lib/prisma";

export const getTenantDb = (organization_id: string, userId?: string, role?: string) => {
  if (!organization_id) throw new Error("Tenant database requested without organization_id");

  return prismadb.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const tenantModels = [
            "crm_Accounts", 
            "crm_Opportunities", 
            "crm_Contacts", 
            "Invoices", 
            "Tasks", 
            "Boards", 
            "crm_campaigns", 
            "crm_Leads"
          ];
          
          if (model && tenantModels.includes(model)) {
            // Force filtering by organization_id for read operations
            if (["findMany", "findFirst", "findUnique", "count", "updateMany", "deleteMany", "aggregate", "groupBy"].includes(operation as string)) {
              args.where = { ...args.where, organization_id };
            }
            
            // Force injecting organization_id for create operations
            if (operation === "create" && args.data) {
              args.data = { ...args.data, organization_id };
            }
            if (operation === "createMany" && args.data) {
              if (Array.isArray(args.data)) {
                args.data = args.data.map((d: any) => ({ ...d, organization_id }));
              }
            }
            
            // For update operations
            if (operation === "update" && args.data) {
              args.data = { ...args.data, organization_id };
            }
          }
          return query(args);
        }
      }
    }
  });
};
