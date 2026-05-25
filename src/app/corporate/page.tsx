import { staticPageMetadata } from "@/lib/seo/config";
import { CorporatePageView } from "@/features/corporate/corporate-page-view";
import { getCorporateBundles } from "@/services/corporate";
import { getStorefrontSettings } from "@/services/storefront-settings";

export async function generateMetadata() {
  return staticPageMetadata("/corporate", {
    title: "Corporate gifting",
    description:
      "Custom corporate gift bundles, sample packages, and bulk order inquiries for teams and clients.",
  });
}

export default async function CorporatePage() {
  const [bundles, settings] = await Promise.all([
    getCorporateBundles(),
    getStorefrontSettings(),
  ]);

  return (
    <CorporatePageView bundles={bundles} support={settings.support} />
  );
}
