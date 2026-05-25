export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "MANAGER",
  "SUPPORT",
  "INVENTORY",
  "MARKETING",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string) {
  return ADMIN_ROLES.includes(role as AdminRole);
}
