"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  FolderOpen,
  Image,
  Images,
  Layers,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Users,
  Star,
  Settings,
  Video,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { adminNavDefs, type AdminPermission } from "@/lib/admin-permissions";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/analytics": BarChart3,
  "/admin/products": Package,
  "/admin/categories": FolderOpen,
  "/admin/collections": Layers,
  "/admin/corporate": Briefcase,
  "/admin/orders": ShoppingCart,
  "/admin/coupons": Tag,
  "/admin/media": Images,
  "/admin/banners": Image,
  "/admin/blog": FileText,
  "/admin/videos": Video,
  "/admin/users": Users,
  "/admin/reviews": Star,
  "/admin/settings": Settings,
};

export const adminNavItems = adminNavDefs.map((d) => ({
  href: d.href,
  label: d.label,
  permission: d.permission as AdminPermission,
  icon: ICONS[d.href] ?? LayoutDashboard,
}));

export function AdminNav({
  allowedHrefs,
  onNavigate,
  className,
}: {
  allowedHrefs: string[];
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const items = adminNavItems.filter((item) => allowedHrefs.includes(item.href));

  return (
    <nav className={cn("space-y-0.5", className)}>
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                : "text-muted hover:bg-stone-100 hover:text-foreground dark:hover:bg-stone-800"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
