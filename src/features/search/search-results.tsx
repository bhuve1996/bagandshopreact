"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts } from "@/lib/api-client";
import type { Product } from "@/types";

export function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["search", q, tag],
    queryFn: async () => {
      if (tag) {
        const result = await fetchProducts({ tags: tag, limit: 48, page: 1 });
        return {
          products: result.items,
          query: tag,
          mode: "tag" as const,
        };
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search failed");
      const json = (await res.json()) as {
        products: Product[];
        query: string;
      };
      return { ...json, mode: "search" as const };
    },
    enabled: q.length > 0 || tag.length > 0,
  });

  if (!q && !tag) {
    return (
      <p className="py-16 text-center text-muted">
        Enter a search term to find products.
      </p>
    );
  }

  if (isLoading) {
    return (
      <>
        <p role="status" className="sr-only">
          Loading search results
        </p>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/5" />
          ))}
        </div>
      </>
    );
  }

  const products = data?.products ?? [];

  const label = data?.mode === "tag" ? data.query : q;

  if (products.length === 0) {
    return (
      <p role="status" className="py-16 text-center text-muted">
        {data?.mode === "tag"
          ? `No products tagged “${label}”.`
          : `No results for “${label}”.`}
      </p>
    );
  }

  return (
    <>
      <p role="status" className="mb-8 text-sm text-muted">
        {data?.mode === "tag"
          ? `${products.length} products tagged “${label}”`
          : `${products.length} results for “${label}”`}
      </p>
      <ProductGrid products={products} />
    </>
  );
}
