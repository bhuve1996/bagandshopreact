import { SiteShell } from "@/components/layout/site-shell";
import { buildSiteNavigation } from "@/lib/site-navigation";
import { StorefrontCopyProvider } from "@/providers/storefront-copy-provider";
import { getCategories } from "@/services/products";
import { getStorefrontSettings } from "@/services/storefront-settings";

export async function SiteShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getStorefrontSettings(),
  ]);
  const { items, categoryItems } = buildSiteNavigation(categories);

  return (
    <StorefrontCopyProvider settings={settings}>
      <SiteShell navigation={items} categoryNav={categoryItems}>
        {children}
      </SiteShell>
    </StorefrontCopyProvider>
  );
}
