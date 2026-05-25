"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogoLink } from "@/components/layout/brand-logo";
import { AdminNav, adminNavItems } from "@/components/admin/admin-nav";
import { siteConfig } from "@/lib/site-content";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLabel =
    adminNavItems.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/admin" && pathname.startsWith(item.href))
    )?.label ?? "Admin";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <BrandLogoLink href="/admin" height={22} />
          <p className="truncate text-xs text-muted">{currentLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open admin menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:z-auto lg:h-screen lg:w-56 lg:shrink-0 lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="hidden border-b border-border px-4 py-5 lg:block">
            <BrandLogoLink href="/admin" height={24} className="mb-1" />
            <p className="text-xs text-muted">{siteConfig.name} Admin</p>
            <Link
              href="/"
              className="mt-1 block text-xs text-muted hover:underline"
            >
              ← Storefront
            </Link>
          </div>
          <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
            <p className="text-sm font-medium">Menu</p>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <AdminNav onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="border-t border-border p-3 lg:hidden">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-stone-100 hover:text-foreground dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              ← Storefront
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
