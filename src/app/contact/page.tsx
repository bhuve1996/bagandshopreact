import { staticPageMetadata } from "@/lib/seo/config";
import { getSiteBrand } from "@/lib/site-brand";
import { getStorefrontSettings } from "@/services/storefront-settings";
import { ContactView } from "@/features/contact/contact-view";

export async function generateMetadata() {
  const brand = await getSiteBrand();
  return staticPageMetadata("/contact", {
    title: "Contact",
    description: `Get in touch with ${brand.name} customer support.`,
  });
}

export default async function ContactPage() {
  const settings = await getStorefrontSettings();
  return <ContactView support={settings.support} />;
}
