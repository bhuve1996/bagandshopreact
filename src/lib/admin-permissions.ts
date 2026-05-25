import type { AdminRole } from "@/lib/roles";

export type AdminPermission =
  | "analytics"
  | "catalog"
  | "orders"
  | "orders:payment"
  | "promotions"
  | "content"
  | "reviews"
  | "settings"
  | "users"
  | "search";

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "analytics",
    "catalog",
    "orders",
    "orders:payment",
    "promotions",
    "content",
    "reviews",
    "settings",
    "users",
    "search",
  ],
  MANAGER: [
    "analytics",
    "catalog",
    "orders",
    "orders:payment",
    "promotions",
    "content",
    "reviews",
    "settings",
    "search",
  ],
  SUPPORT: ["orders", "reviews"],
  INVENTORY: ["catalog"],
  MARKETING: ["analytics", "promotions", "content", "settings"],
};

export function hasAdminPermission(
  role: string,
  permission: AdminPermission
): boolean {
  if (role === "SUPER_ADMIN") return true;
  const perms = ROLE_PERMISSIONS[role as AdminRole];
  if (!perms) return false;
  return perms.includes(permission);
}

export type AdminNavItemDef = {
  href: string;
  label: string;
  permission: AdminPermission;
};

export const adminNavDefs: AdminNavItemDef[] = [
  { href: "/admin", label: "Dashboard", permission: "analytics" },
  { href: "/admin/analytics", label: "Analytics", permission: "analytics" },
  { href: "/admin/products", label: "Products", permission: "catalog" },
  { href: "/admin/categories", label: "Categories", permission: "catalog" },
  { href: "/admin/collections", label: "Collections", permission: "catalog" },
  { href: "/admin/corporate", label: "Gifting bundles", permission: "content" },
  { href: "/admin/orders", label: "Orders", permission: "orders" },
  { href: "/admin/coupons", label: "Coupons", permission: "promotions" },
  { href: "/admin/media", label: "Media gallery", permission: "catalog" },
  { href: "/admin/banners", label: "Banners", permission: "promotions" },
  { href: "/admin/blog", label: "Blog", permission: "content" },
  { href: "/admin/videos", label: "Videos", permission: "content" },
  { href: "/admin/users", label: "Users", permission: "users" },
  { href: "/admin/reviews", label: "Reviews", permission: "reviews" },
  { href: "/admin/settings", label: "Content & labels", permission: "settings" },
];

export function getAdminNavHrefsForRole(role: string): string[] {
  const hrefs = adminNavDefs
    .filter((item) => hasAdminPermission(role, item.permission))
    .map((item) => item.href);
  if (hrefs.length === 0) return ["/admin/orders"];
  if (!hrefs.includes("/admin") && hasAdminPermission(role, "analytics")) {
    return ["/admin", ...hrefs.filter((h) => h !== "/admin")];
  }
  return hrefs;
}
