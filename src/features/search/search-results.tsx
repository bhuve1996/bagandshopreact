"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

export function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json() as Promise<{ products: Product[]; query: string }>;
    },
    enabled: q.length > 0,
  });

  if (!q) {
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

  if (products.length === 0) {
    return (
      <p role="status" className="py-16 text-center text-muted">
        No results for &ldquo;{q}&rdquo;
      </p>
    );
  }

  return (
    <>
      <p role="status" className="mb-8 text-sm text-muted">
        {products.length} results for &ldquo;{q}&rdquo;
      </p>
      <ProductGrid products={products} />
    </>
  );
}
