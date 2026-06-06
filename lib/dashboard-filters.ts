import { AppUser } from "./auth";

/**
 * Builds a Prisma `where` clause for CRM items (Leads, Opportunities, Contacts, Accounts)
 * that use the `assigned_to` and `organization_id` fields.
 */
export const buildCrmFilter = (user: AppUser) => {
  const filter: any = { deletedAt: null };

  // Always strictly isolate by organization if they have one (even for admins)
  // Developers can see everything, but they might want to filter by org too if we build a switcher.
  if (user.role !== "developer" && user.organization_id) {
    filter.organization_id = user.organization_id;
  } else if (user.role === "developer" && user.organization_id) {
    // If developer is logged into an org, restrict to that org. If null, see all.
    filter.organization_id = user.organization_id;
  }

  // Role-based visibility
  if (user.role === "admin" || user.role === "developer") {
    // Admins and Developers see ALL records within the organization
    return filter;
  }

  if (user.role === "manager") {
    // Managers see records assigned to themselves AND their subordinates
    filter.assigned_to_user = {
      OR: [
        { id: user.id },
        { managerId: user.id }
      ]
    };
    return filter;
  }

  // Regular Users ONLY see their own records
  filter.assigned_to = user.id;

  return filter;
};

/**
 * Builds a Prisma `where` clause for Tasks, which uses `user` instead of `assigned_to`
 */
export const buildTaskFilter = (appUser: AppUser) => {
  const filter: any = {};

  if (appUser.role !== "developer" && appUser.organization_id) {
    filter.organization_id = appUser.organization_id;
  } else if (appUser.role === "developer" && appUser.organization_id) {
    filter.organization_id = appUser.organization_id;
  }

  if (appUser.role === "admin" || appUser.role === "developer") {
    return filter;
  }

  if (appUser.role === "manager") {
    filter.assigned_user = {
      OR: [
        { id: appUser.id },
        { managerId: appUser.id }
      ]
    };
    return filter;
  }

  filter.user = appUser.id;
  return filter;
};
