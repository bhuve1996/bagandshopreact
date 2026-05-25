"use client";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SkipLink } from "@/components/layout/skip-link";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { CartSync } from "@/components/layout/cart-sync";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { ShopAssistant } from "@/features/assistant/shop-assistant";
import type { NavItem } from "@/types";

type SiteShellProps = {
  children: React.ReactNode;
  navigation: NavItem[];
  categoryNav: NavItem[];
};

export function SiteShell({ children, navigation, categoryNav }: SiteShellProps) {
  return (
    <>
      <SkipLink />
      <AnnouncementBar />
      <Header navigation={navigation} categoryNav={categoryNav} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <MobileMenu navigation={navigation} categoryNav={categoryNav} />
      <CartSync />
      <AnalyticsTracker />
      <ShopAssistant />
    </>
  );
}
