import type { Category, Collection, Product } from "@/types";
import { applyCollectionSlugToFilters } from "@/lib/collection-slugs";
import { isDatabaseReady } from "@/lib/db-ready";
import { mapCategory, mapCollection, mapProduct } from "@/lib/mappers";
import { getPrisma } from "@/lib/prisma";

export type ProductFilters = {
  category?: string;
  collection?: string;
  collectionSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isBestseller?: boolean;
  isNew?: boolean;
  device?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "rating" | "popular";
  page?: number;
  limit?: number;
};

export type PaginatedProducts = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

function emptyPage(page: number, limit: number): PaginatedProducts {
  return { items: [], total: 0, page, limit, hasMore: false };
}

function orderBy(sort?: ProductFilters["sort"]) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "rating":
      return { rating: "desc" as const };
    case "popular":
      return { reviewCount: "desc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<PaginatedProducts> {
  const resolvedFilters = applyCollectionSlugToFilters(filters);
  const page = resolvedFilters.page ?? 1;
  const limit = resolvedFilters.limit ?? 12;
  const skip = (page - 1) * limit;

  if (!(await isDatabaseReady())) {
    return emptyPage(page, limit);
  }

  const where: Record<string, unknown> = {};

  if (resolvedFilters.category) {
    where.category = { slug: resolvedFilters.category };
  }
  const col = resolvedFilters.collectionSlug ?? resolvedFilters.collection;
  if (col === "best-sellers") where.isBestseller = true;
  else if (col === "new-arrivals") where.isNew = true;
  else if (col === "work-anywhere") {
    where.category = { slug: { in: ["desk", "bags", "tech"] } };
  } else if (col === "gift-sets" || col === "everyday") {
    where.OR = [{ isBestseller: true }, { isNew: true }, { collectionSlug: "everyday" }];
  } else if (col) {
    where.OR = [{ collectionSlug: col }, { category: { slug: col } }];
  }
  if (resolvedFilters.isBestseller) where.isBestseller = true;
  if (resolvedFilters.isNew) where.isNew = true;
  if (resolvedFilters.device) {
    where.device = { contains: resolvedFilters.device, mode: "insensitive" };
  }
  if (resolvedFilters.minPrice != null || resolvedFilters.maxPrice != null) {
    where.price = {
      ...(resolvedFilters.minPrice != null
        ? { gte: resolvedFilters.minPrice }
        : {}),
      ...(resolvedFilters.maxPrice != null
        ? { lte: resolvedFilters.maxPrice }
        : {}),
    };
  }
  if (resolvedFilters.tags?.length) where.tags = { hasSome: resolvedFilters.tags };
  if (resolvedFilters.search) {
    const term = resolvedFilters.search;
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { tags: { has: term } },
    ];
  }

  const [rows, total] = await Promise.all([
    getPrisma().product.findMany({
      where,
      include: { category: true, variants: true },
      orderBy: orderBy(resolvedFilters.sort),
      skip,
      take: limit,
    }),
    getPrisma().product.count({ where }),
  ]);

  return {
    items: rows.map(mapProduct),
    total,
    page,
    limit,
    hasMore: skip + limit < total,
  };
}

/** All products for Algolia / bulk jobs (paginated reads). */
export async function getAllProductsForSearch(): Promise<Product[]> {
  const all: Product[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const { items, hasMore } = await getProducts({ page, limit });
    all.push(...items);
    if (!hasMore) break;
    page += 1;
  }

  return all;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!(await isDatabaseReady())) {
    return null;
  }
  const row = await getPrisma().product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true,
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });
  return row ? mapProduct(row) : null;
}

/** Other products in the same category (slug from Admin → Products). */
export async function getProductsByCategory(
  product: Product,
  options: {
    limit: number;
    excludeIds?: string[];
    sort?: ProductFilters["sort"];
  }
): Promise<Product[]> {
  const exclude = new Set([product.id, ...(options.excludeIds ?? [])]);
  const result = await getProducts({
    category: product.category,
    limit: options.limit + exclude.size + 4,
    page: 1,
    sort: options.sort ?? "popular",
  });
  return result.items.filter((p) => !exclude.has(p.id)).slice(0, options.limit);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  return getProductsByCategory(product, { limit, sort: "popular" });
}

export async function getCategories(): Promise<Category[]> {
  if (!(await isDatabaseReady())) return [];
  const rows = await getPrisma().category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map(mapCategory);
}

export async function getCollections(): Promise<Collection[]> {
  if (!(await isDatabaseReady())) return [];
  const rows = await getPrisma().collection.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapCollection);
}

export async function getCategoryBySlug(slug: string) {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}

export async function getCollectionBySlug(slug: string) {
  const cols = await getCollections();
  return cols.find((c) => c.slug === slug) ?? null;
}

export type CategoryShowcaseTile = {
  id: string;
  slug: string;
  name: string;
  image: string;
  productCount: number;
};

/** Compact category tiles for homepage (imported catalog only). */
export async function getCategoryShowcase(
  limit = 6
): Promise<CategoryShowcaseTile[]> {
  const categories = await getCategories();
  return categories
    .filter((c) => c.productCount > 0 && Boolean(c.image))
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      image: c.image,
      productCount: c.productCount,
    }));
}
