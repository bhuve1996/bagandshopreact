import type { ProductFilters } from "@/services/products";

/** Legacy / marketing slugs → canonical collection slug */
const SLUG_ALIASES: Record<string, string> = {
  wfa: "work-anywhere",
  gifts: "gift-sets",
};

/** Nav sub-links → parent category for product filtering */
const SUBCATEGORY_TO_CATEGORY: Record<string, string> = {
  "tote-bags": "bags",
  crossbody: "bags",
  "laptop-bags": "bags",
  "phone-cases": "tech",
  airpods: "tech",
  "watch-bands": "tech",
  chargers: "tech",
  organizers: "desk",
  "mouse-pads": "desk",
  stands: "desk",
  cables: "desk",
  passport: "travel",
  packing: "travel",
  "luggage-tags": "travel",
};

const CATEGORY_SLUGS = new Set(["bags", "tech", "desk", "travel"]);
const COLLECTION_SLUGS = new Set([
  "new-arrivals",
  "best-sellers",
  "work-anywhere",
  "gift-sets",
  "everyday",
]);
const DEVICE_SLUGS = new Set([
  "iphone",
  "samsung",
  "macbook",
  "ipad",
  "airpods",
  "watch",
]);

export const DEVICE_QUERY: Record<string, string> = {
  iphone: "iPhone",
  samsung: "Samsung",
  macbook: "MacBook",
  ipad: "iPad",
  airpods: "AirPods",
  watch: "Watch",
};

export function formatSlugTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Parent category slug when `slug` is a nav sub-collection (e.g. phone-cases → tech). */
export function getParentCategorySlug(rawSlug: string): string | undefined {
  const slug = normalizeCollectionSlug(rawSlug);
  return SUBCATEGORY_TO_CATEGORY[slug];
}

export function normalizeCollectionSlug(raw: string): string {
  return SLUG_ALIASES[raw] ?? raw;
}

export type ResolvedCollection = {
  slug: string;
  filters: ProductFilters;
  label?: string;
};

export function resolveCollectionSlug(raw: string): ResolvedCollection {
  const slug = normalizeCollectionSlug(raw);

  if (slug === "best-sellers") {
    return { slug, filters: { collectionSlug: slug, isBestseller: true } };
  }
  if (slug === "new-arrivals") {
    return { slug, filters: { collectionSlug: slug, isNew: true } };
  }
  if (DEVICE_SLUGS.has(slug)) {
    const device = DEVICE_QUERY[slug] ?? formatSlugTitle(slug);
    return {
      slug,
      filters: { collectionSlug: slug, device },
      label: `${device} accessories`,
    };
  }
  if (CATEGORY_SLUGS.has(slug)) {
    return { slug, filters: { collectionSlug: slug, category: slug } };
  }
  if (COLLECTION_SLUGS.has(slug)) {
    return { slug, filters: { collectionSlug: slug } };
  }
  const parent = SUBCATEGORY_TO_CATEGORY[slug];
  if (parent) {
    return {
      slug,
      filters: { category: parent },
      label: formatSlugTitle(slug),
    };
  }

  return { slug, filters: { collectionSlug: slug }, label: formatSlugTitle(slug) };
}

export function applyCollectionSlugToFilters(
  filters: ProductFilters
): ProductFilters {
  const raw = filters.collectionSlug ?? filters.collection;
  if (!raw) return filters;

  const { filters: resolved } = resolveCollectionSlug(raw);
  return {
    ...filters,
    collectionSlug: resolved.collectionSlug ?? raw,
    category: filters.category ?? resolved.category,
    collection: filters.collection ?? resolved.collection,
    device: filters.device ?? resolved.device,
    isBestseller: filters.isBestseller ?? resolved.isBestseller,
    isNew: filters.isNew ?? resolved.isNew,
    tags: filters.tags ?? resolved.tags,
  };
}
