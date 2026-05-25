"use client";

import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { fetchProduct, fetchProducts } from "@/lib/api-client";
import type { ProductFilters } from "@/services/products";

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () =>
      fetchProducts({
        category: filters.category,
        collection: filters.collection,
        collectionSlug: filters.collectionSlug ?? filters.collection,
        search: filters.search,
        device: filters.device,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        tags: filters.tags?.join(","),
        bestseller: filters.isBestseller,
        new: filters.isNew,
        sort: filters.sort,
        page: filters.page ?? 1,
        limit: filters.limit ?? 12,
      }),
  });
}

export function useInfiniteProducts(
  filters: Omit<ProductFilters, "page">
) {
  return useInfiniteQuery({
    queryKey: ["products-infinite", filters],
    queryFn: ({ pageParam }) =>
      fetchProducts({
        category: filters.category,
        collectionSlug: filters.collectionSlug ?? filters.collection,
        search: filters.search,
        device: filters.device,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        tags: filters.tags?.join(","),
        bestseller: filters.isBestseller,
        new: filters.isNew,
        sort: filters.sort,
        page: pageParam,
        limit: filters.limit ?? 12,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.hasMore ? last.page + 1 : undefined,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  });
}
