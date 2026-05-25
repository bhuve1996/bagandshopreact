import {
  getProductBySlug,
  getProducts,
  getProductsByCategory,
} from "@/services/products";
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
    return getProductsByCategory(product, { limit, sort: "popular" });
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

/** Same category as the product (set in Admin → Products); excludes “You may also like” picks. */
export async function getFrequentlyBoughtTogether(
  productSlug: string,
  excludeIds: string[] = []
): Promise<Product[]> {
  const product = await getProductBySlug(productSlug);
  if (!product) return [];
  return getProductsByCategory(product, {
    limit: 3,
    excludeIds,
    sort: "popular",
  });
}
