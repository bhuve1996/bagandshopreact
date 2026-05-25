import { PolicyPageView } from "@/components/content/policy-page-view";
import { getPolicyPage } from "@/lib/policy-pages";
import { staticPageMetadata } from "@/lib/seo/config";
import { getStorefrontSettings } from "@/services/storefront-settings";

export async function generateMetadata() {
  const { policyPages } = await getStorefrontSettings();
  const page = getPolicyPage(policyPages, "shipping");
  return staticPageMetadata("/shipping", {
    title: page.title,
    description: page.description,
  });
}

export default async function ShippingPage() {
  const { policyPages } = await getStorefrontSettings();
  return <PolicyPageView page={getPolicyPage(policyPages, "shipping")} />;
}
