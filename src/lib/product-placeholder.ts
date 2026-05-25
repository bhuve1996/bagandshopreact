/** Default image when a product, category, or bundle has no gallery asset. */
export const PRODUCT_PLACEHOLDER_IMAGE =
  "/products/_placeholders/placeholder-bagnshop.png";

export function productImageUrl(
  images: string[] | null | undefined,
  index = 0
): string {
  const src = images?.[index]?.trim();
  return src || PRODUCT_PLACEHOLDER_IMAGE;
}

/** Gift/corporate bundle cards — never use a product's main gallery file as the set photo. */
const PRODUCT_MAIN_IMAGE = /^\/products\/[^/]+\/main\.(png|jpe?g|webp|gif|avif)$/i;

export function giftBundleImageUrl(image: string | null | undefined): string {
  const src = image?.trim();
  if (!src || PRODUCT_MAIN_IMAGE.test(src)) return PRODUCT_PLACEHOLDER_IMAGE;
  return src;
}
