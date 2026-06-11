/**
 * OPENALGON CRM — Permission Mapping
 * 
 * Custom simple access control without Better Auth dependency.
 */

const statements = {
  user: ["create", "read", "update", "delete", "changeRole", "activate", "deactivate"],
  crm: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  report: ["read", "export"],
  settings: ["read", "update"],
} as const;

export const admin = {
  user: ["create", "read", "update", "delete", "changeRole", "activate", "deactivate"],
  crm: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  report: ["read", "export"],
  settings: ["read", "update"],
};

export const manager = {
  user: ["read"],
  crm: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  report: ["read", "export"],
  settings: ["read"],
};

export const user = {
  user: ["read"],
  crm: ["read"],
  project: ["read"],
  report: ["read"],
  settings: ["read"],
};

// Access Control helper to prevent breakages if imported elsewhere
export const ac = {
  newRole: (permissions: any) => permissions,
  statements,
};

export function checkPermission(roleName: string, module: keyof typeof statements, action: string): boolean {
  if (roleName === "superAdmin" || roleName === "developer") return true;
  
  let rolePermissions: any = undefined;
  if (roleName === "admin") rolePermissions = admin;
  else if (roleName === "manager") rolePermissions = manager;
  else if (roleName === "user") rolePermissions = user;

  if (!rolePermissions) return false;

  const modulePerms = rolePermissions[module];
  if (!modulePerms) return false;

  return modulePerms.includes(action);
}

