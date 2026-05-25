/** Resolve PDP meta from product fields with optional SEO overrides. */
export function resolveProductSeoFields(product: {
  name: string;
  description: string;
  images: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
}) {
  const title = product.metaTitle?.trim() || product.name;
  const description =
    product.metaDescription?.trim() || product.description;
  const image =
    product.ogImage?.trim() || product.images[0] || undefined;

  return { title, description, image };
}
