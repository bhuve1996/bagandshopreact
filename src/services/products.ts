import {
  categories as mockCategories,
  collections as mockCollections,
  products as mockProducts,
  getProductBySlug as mockGetBySlug,
} from "@/lib/mock-data";
import { applyCollectionSlugToFilters } from "@/lib/collection-slugs";
import { isDatabaseReady } from "@/lib/db-ready";
import { mapCategory, mapCollection, mapProduct } from "@/lib/mappers";
import { getPrisma } from "@/lib/prisma";
import type { Category, Collection, Product } from "@/types";

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

function sortMock(products: Product[], sort?: ProductFilters["sort"]) {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    case "popular":
      return list.sort((a, b) => b.reviewCount - a.reviewCount);
    case "newest":
    default:
      return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }
}

function filterMock(filters: ProductFilters): Product[] {
  const resolved = applyCollectionSlugToFilters(filters);
  let list = [...mockProducts];
  const slug = resolved.collection ?? resolved.collectionSlug ?? resolved.category;

  if (resolved.category) {
    list = list.filter((p) => p.category === resolved.category);
  }
  if (resolved.collectionSlug || resolved.collection) {
    const col = resolved.collectionSlug ?? resolved.collection;
    if (col === "best-sellers") list = list.filter((p) => p.isBestseller);
    else if (col === "new-arrivals") list = list.filter((p) => p.isNew);
    else if (col === "work-anywhere") {
      list = list.filter((p) =>
        ["desk", "bags", "tech"].includes(p.category)
      );
    } else if (col === "gift-sets" || col === "everyday") {
      list = list.filter(
        (p) => p.isBestseller || p.isNew || p.collection === "everyday"
      );
    } else {
      list = list.filter(
        (p) => p.collection === col || p.category === col
      );
    }
  }
  if (slug === "best-sellers") list = list.filter((p) => p.isBestseller);
  if (slug === "new-arrivals") list = list.filter((p) => p.isNew);
  if (resolved.isBestseller) list = list.filter((p) => p.isBestseller);
  if (resolved.isNew) list = list.filter((p) => p.isNew);
  if (resolved.device) {
    list = list.filter((p) =>
      p.device?.toLowerCase().includes(resolved.device!.toLowerCase())
    );
  }
  if (resolved.minPrice != null) list = list.filter((p) => p.price >= resolved.minPrice!);
  if (resolved.maxPrice != null) list = list.filter((p) => p.price <= resolved.maxPrice!);
  if (resolved.tags?.length) {
    list = list.filter((p) => resolved.tags!.some((t) => p.tags.includes(t)));
  }
  if (resolved.search) {
    const q = resolved.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }
  return sortMock(list, resolved.sort);
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
    const all = filterMock(resolvedFilters);
    const items = all.slice(skip, skip + limit);
    return {
      items,
      total: all.length,
      page,
      limit,
      hasMore: skip + limit < all.length,
    };
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
    where.OR = [
      { name: { contains: resolvedFilters.search, mode: "insensitive" } },
      {
        description: { contains: resolvedFilters.search, mode: "insensitive" },
      },
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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!(await isDatabaseReady())) {
    return mockGetBySlug(slug) ?? null;
  }
  const row = await getPrisma().product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });
  return row ? mapProduct(row) : null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const result = await getProducts({
    category: product.category,
    limit: limit + 1,
    page: 1,
  });
  return result.items.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  if (!(await isDatabaseReady())) return mockCategories;
  const rows = await getPrisma().category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map(mapCategory);
}

export async function getCollections(): Promise<Collection[]> {
  if (!(await isDatabaseReady())) return mockCollections;
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
