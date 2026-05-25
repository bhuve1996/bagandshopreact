import { staticPageMetadata } from "@/lib/seo/config";
import { getStorefrontSettings } from "@/services/storefront-settings";
import { ContactView } from "@/features/contact/contact-view";

export async function generateMetadata() {
  return staticPageMetadata("/contact", {
    title: "Contact",
    description: "Get in touch with Bag & Shop customer support.",
  });
}

export default async function ContactPage() {
  const settings = await getStorefrontSettings();
  return <ContactView support={settings.support} />;
}
