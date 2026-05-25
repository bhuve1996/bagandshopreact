import type { BreadcrumbItem } from "@/lib/breadcrumbs";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-url";
import { brandAssets } from "@/lib/site-content";
import { resolveProductSeoFields } from "@/lib/seo/product-metadata";
import type { Product } from "@/types";

function cleanJson<T extends Record<string, unknown>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd(
  brandName: string,
  logoPath: string = brandAssets.logo
) {
  const url = getSiteUrl();
  const logo = logoPath.startsWith("http") ? logoPath : absoluteUrl(logoPath);
  return cleanJson({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: brandName,
    url,
    logo,
  });
}

export function websiteJsonLd(brandName: string) {
  const url = getSiteUrl();
  return cleanJson({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: brandName,
    url,
    publisher: { "@id": `${url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  if (items.length === 0) return null;
  return cleanJson({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  });
}

function productAvailability(product: Product): string {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    return "https://schema.org/InStock";
  }
  const anyInStock = variants.some((v) => v.inStock);
  return anyInStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

function productSku(product: Product): string {
  const variantSku = product.variants?.find((v) => v.sku)?.sku;
  return variantSku ?? product.slug;
}

export function productJsonLd(product: Product, brandName: string) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const seo = resolveProductSeoFields(product);
  const images = product.images.map((src) =>
    src.startsWith("http") ? src : absoluteUrl(src)
  );

  return cleanJson({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: seo.description,
    image: images,
    sku: productSku(product),
    brand: { "@type": "Brand", name: brandName },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.price,
      availability: productAvailability(product),
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: brandName },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(product.tags.length > 0 ? { keywords: product.tags.join(", ") } : {}),
  });
}

export function ProductJsonLd({
  product,
  brandName,
}: {
  product: Product;
  brandName: string;
}) {
  return <JsonLd data={productJsonLd(product, brandName)} />;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = breadcrumbJsonLd(items);
  if (!data) return null;
  return <JsonLd data={data} />;
}

export function faqPageJsonLd(
  faqs: { q: string; a: string }[]
) {
  return cleanJson({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  });
}

export function FaqJsonLd({ faqs }: { faqs: { q: string; a: string }[] }) {
  return <JsonLd data={faqPageJsonLd(faqs)} />;
}
