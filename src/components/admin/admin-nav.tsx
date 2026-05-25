"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const adminNavItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/media", label: "Media gallery", icon: Images },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Content & labels", icon: Settings },
];

export function AdminNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-0.5", className)}>
      {adminNavItems.map((item) => {
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
