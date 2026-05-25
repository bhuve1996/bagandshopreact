"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { isAdminRole } from "@/lib/roles";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { BrandLogoLink } from "@/components/layout/brand-logo";
import { CategoryNavStrip } from "@/components/layout/category-nav-strip";
import { MegaMenu } from "@/components/layout/mega-menu";
import { cn } from "@/lib/utils";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import type { NavItem } from "@/types";

type HeaderProps = {
  navigation: NavItem[];
  categoryNav: NavItem[];
};

export function Header({ navigation, categoryNav }: HeaderProps) {
  const [activeNav, setActiveNav] = useState<NavItem | null>(null);
  const { itemCount } = useCartTotals();
  const openCart = useCartStore((s) => s.openCart);
  const { setSearchOpen, setMobileMenuOpen } = useUIStore();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
      <div className="container-page relative flex h-16 items-center justify-between lg:h-18">
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-full p-2 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <BrandLogoLink
          height={28}
          priority
          className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
        />

        <nav
          aria-label="Primary"
          className="scrollbar-none hidden max-w-[min(52vw,42rem)] items-center gap-5 overflow-x-auto lg:flex xl:max-w-none xl:gap-6"
          onMouseLeave={() => setActiveNav(null)}
        >
          {navigation.map((item) => {
            const hasPanel =
              (item.children?.length ?? 0) > 0 || Boolean(item.banner);
            return (
            <div
              key={item.label}
              onMouseEnter={() => setActiveNav(hasPanel ? item : null)}
              onFocus={() => setActiveNav(hasPanel ? item : null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-muted focus-visible:underline",
                  activeNav?.label === item.label && "text-muted"
                )}
                aria-expanded={
                  item.children?.length
                    ? activeNav?.label === item.label
                    : undefined
                }
                aria-controls={
                  item.children?.length ? "mega-menu-panel" : undefined
                }
              >
                {item.label}
              </Link>
            </div>
          );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/wishlist"
            className="hidden rounded-full p-2 hover:bg-stone-100 sm:inline-flex dark:hover:bg-stone-800"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/account"
            className="hidden rounded-full p-2 hover:bg-stone-100 sm:inline-flex dark:hover:bg-stone-800"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          {session?.user?.role && isAdminRole(session.user.role) && (
            <Link
              href="/admin"
              className="hidden text-xs font-medium text-muted hover:text-foreground sm:inline"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
            aria-label={
              itemCount > 0
                ? `Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`
                : "Open cart"
            }
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-bold text-white dark:bg-stone-100 dark:text-stone-900">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <MegaMenu
        item={activeNav}
        open={
          !!activeNav &&
          ((activeNav.children?.length ?? 0) > 0 || Boolean(activeNav.banner))
        }
      />
      <CategoryNavStrip categories={categoryNav} />
    </header>
  );
}
