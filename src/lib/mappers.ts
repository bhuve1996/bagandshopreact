import type { Category, Collection, Product, ProductVariant } from "@/types";

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  hoverImage: string | null;
  tags: string[];
  rating: number;
  reviewCount: number;
  device: string | null;
  isNew: boolean;
  isBestseller: boolean;
  collectionSlug: string | null;
  category: { slug: string; name: string };
  variants?: {
    id: string;
    name: string;
    color: string | null;
    image: string | null;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    sku: string | null;
  }[];
};

export function mapProduct(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    metaTitle: p.metaTitle ?? undefined,
    metaDescription: p.metaDescription ?? undefined,
    ogImage: p.ogImage ?? undefined,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    images: p.images,
    hoverImage: p.hoverImage ?? undefined,
    category: p.category.slug,
    categoryName: p.category.name,
    collection: p.collectionSlug ?? undefined,
    tags: p.tags,
    rating: p.rating,
    reviewCount: p.reviewCount,
    device: p.device ?? undefined,
    isNew: p.isNew,
    isBestseller: p.isBestseller,
    variants: p.variants?.map(mapVariant),
  };
}

function mapVariant(v: NonNullable<DbProduct["variants"]>[number]): ProductVariant {
  return {
    id: v.id,
    name: v.name,
    color: v.color ?? undefined,
    image: v.image ?? undefined,
    price: v.price,
    compareAtPrice: v.compareAtPrice ?? undefined,
    inStock: v.stock > 0,
    sku: v.sku ?? undefined,
  };
}

export function mapCategory(c: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string;
  _count?: { products: number };
}): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description ?? undefined,
    image: c.image,
    productCount: c._count?.products ?? 0,
  };
}

export function mapCollection(c: {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  accent: string | null;
}): Collection {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
    accent: c.accent ?? undefined,
  };
}
