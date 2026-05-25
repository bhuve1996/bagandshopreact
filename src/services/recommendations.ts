import { getProductBySlug, getProducts } from "@/services/products";
import type { Product } from "@/types";

export async function getRecommendations(params: {
  productSlug?: string;
  category?: string;
  limit?: number;
}): Promise<Product[]> {
  const limit = params.limit ?? 4;

  if (params.productSlug) {
    const product = await getProductBySlug(params.productSlug);
    if (!product) return [];
    const related = await getProducts({
      category: product.category,
      limit: limit + 2,
      page: 1,
    });
    return related.items
      .filter((p) => p.id !== product.id)
      .slice(0, limit);
  }

  if (params.category) {
    const result = await getProducts({
      category: params.category,
      limit,
      sort: "popular",
      page: 1,
    });
    return result.items;
  }

  const bestsellers = await getProducts({
    collectionSlug: "best-sellers",
    limit,
    page: 1,
  });
  return bestsellers.items;
}

/** Simple “frequently bought together” — same category, higher price band */
export async function getFrequentlyBoughtTogether(
  productSlug: string
): Promise<Product[]> {
  const product = await getProductBySlug(productSlug);
  if (!product) return [];
  const result = await getProducts({
    category: product.category,
    minPrice: Math.floor(product.price * 0.5),
    limit: 3,
    page: 1,
  });
  return result.items.filter((p) => p.id !== product.id).slice(0, 3);
}
