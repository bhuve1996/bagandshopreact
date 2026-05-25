import { staticPageMetadata } from "@/lib/seo/config";
import { GiftingPageView } from "@/features/gifting/gifting-page-view";
import { getGiftingBundles } from "@/services/corporate";

export async function generateMetadata() {
  return staticPageMetadata("/gifting", {
    title: "Perfect gifting",
    description:
      "Ready-made gift bundles for birthdays, housewarmings, and special occasions — shop curated sets from BagnShop.",
  });
}

export default async function GiftingPage() {
  const bundles = await getGiftingBundles();
  return <GiftingPageView bundles={bundles} />;
}
