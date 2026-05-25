import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { getSiteBrand } from "@/lib/site-brand";
import { getSeoSettings } from "@/lib/seo/config";

export async function SiteJsonLd() {
  const [brand, seo] = await Promise.all([getSiteBrand(), getSeoSettings()]);

  return (
    <>
      <JsonLd data={organizationJsonLd(brand.name, seo.organizationLogo)} />
      <JsonLd data={websiteJsonLd(brand.name)} />
    </>
  );
}
