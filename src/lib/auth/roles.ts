// src/lib/auth/roles.ts
// Role hierarchy and permission checks

export type AppRole = "SUPER_ADMIN" | "ADMIN" | "USER";

/** Whether a role can access admin panel at all */
export function isAdminRole(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/** Whether a role is super admin (full access) */
export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}

/** Permission: manage other admins (add/remove/role change) */
export function canManageAdmins(role: string): boolean {
  return role === "SUPER_ADMIN";
}

/** Permission: approve/reject payments */
export function canApprovePayments(role: string): boolean {
  return role === "SUPER_ADMIN";
}

/** Permission: view revenue stats */
export function canViewRevenue(role: string): boolean {
  return role === "SUPER_ADMIN";
}

/** Permission: manage coupons */
export function canManageCoupons(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/** Permission: manage discount rules */
export function canManageDiscounts(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/** Permission: manage templates */
export function canManageTemplates(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/** Permission: manage settings */
export function canManageSettings(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/** Permission: view users */
export function canViewUsers(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/** Permission: manage 2FA security */
export function canManageSecurity(role: string): boolean {
  return role === "SUPER_ADMIN";
}

/** Permission: edit/delete users */
export function canEditDeleteUsers(role: string): boolean {
  return role === "SUPER_ADMIN";
}

/** Badge label for display */
export function roleBadgeLabel(role: string): string {
  switch (role) {
    case "SUPER_ADMIN": return "SUPER ADMIN";
    case "ADMIN": return "ADMIN";
    default: return "USER";
  }
}

/** Badge color gradient */
export function roleBadgeColors(role: string): { from: string; to: string } {
  switch (role) {
    case "SUPER_ADMIN": return { from: "#dc2626", to: "#f97316" };
    case "ADMIN": return { from: "#1a3a6b", to: "#4a9fd4" };
    default: return { from: "#6b7280", to: "#9ca3af" };
  }
}
