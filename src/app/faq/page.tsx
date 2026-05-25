import { FaqJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata-helpers";
import { getStorefrontSettings } from "@/services/storefront-settings";

export async function generateMetadata() {
  const { seo } = await getStorefrontSettings();
  return pageMetadata({
    title: seo.faqMetaTitle,
    description: seo.faqMetaDescription,
    path: "/faq",
    image: seo.defaultOgImage,
  });
}

export default async function FAQPage() {
  const { seo } = await getStorefrontSettings();
  const faqs = seo.faqItems;

  return (
    <>
      <FaqJsonLd faqs={faqs} />
      <div className="section-padding">
        <div className="container-page max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
          <dl className="mt-10 space-y-8">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-2 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  );
}
