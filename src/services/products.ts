import {
  categories as mockCategories,
  collections as mockCollections,
  products as mockProducts,
  getProductBySlug as mockGetBySlug,
} from "@/lib/mock-data";
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
  let list = [...mockProducts];
  const slug = filters.collection ?? filters.collectionSlug ?? filters.category;

  if (filters.category) {
    list = list.filter((p) => p.category === filters.category);
  }
  if (filters.collectionSlug || filters.collection) {
    const col = filters.collectionSlug ?? filters.collection;
    if (col === "best-sellers") list = list.filter((p) => p.isBestseller);
    else if (col === "new-arrivals") list = list.filter((p) => p.isNew);
    else list = list.filter((p) => p.collection === col || p.category === col);
  }
  if (slug === "best-sellers") list = list.filter((p) => p.isBestseller);
  if (slug === "new-arrivals") list = list.filter((p) => p.isNew);
  if (filters.isBestseller) list = list.filter((p) => p.isBestseller);
  if (filters.isNew) list = list.filter((p) => p.isNew);
  if (filters.device) list = list.filter((p) => p.device?.toLowerCase().includes(filters.device!.toLowerCase()));
  if (filters.minPrice != null) list = list.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) list = list.filter((p) => p.price <= filters.maxPrice!);
  if (filters.tags?.length) {
    list = list.filter((p) => filters.tags!.some((t) => p.tags.includes(t)));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }
  return sortMock(list, filters.sort);
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
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;
  const skip = (page - 1) * limit;

  if (!(await isDatabaseReady())) {
    const all = filterMock(filters);
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

  if (filters.category) {
    where.category = { slug: filters.category };
  }
  const col = filters.collectionSlug ?? filters.collection;
  if (col === "best-sellers") where.isBestseller = true;
  else if (col === "new-arrivals") where.isNew = true;
  else if (col) where.OR = [{ collectionSlug: col }, { category: { slug: col } }];
  if (filters.isBestseller) where.isBestseller = true;
  if (filters.isNew) where.isNew = true;
  if (filters.device) where.device = { contains: filters.device, mode: "insensitive" };
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.tags?.length) where.tags = { hasSome: filters.tags };
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    getPrisma().product.findMany({
      where,
      include: { category: true, variants: true },
      orderBy: orderBy(filters.sort),
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
