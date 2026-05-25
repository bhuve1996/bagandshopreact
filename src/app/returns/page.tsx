import { PolicyPageView } from "@/components/content/policy-page-view";
import { getPolicyPage } from "@/lib/policy-pages";
import { staticPageMetadata } from "@/lib/seo/config";
import { getStorefrontSettings } from "@/services/storefront-settings";

export async function generateMetadata() {
  const { policyPages } = await getStorefrontSettings();
  const page = getPolicyPage(policyPages, "returns");
  return staticPageMetadata("/returns", {
    title: page.title,
    description: page.description,
  });
}

export default async function ReturnsPage() {
  const { policyPages } = await getStorefrontSettings();
  return <PolicyPageView page={getPolicyPage(policyPages, "returns")} />;
}
