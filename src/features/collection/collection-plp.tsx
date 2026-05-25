"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  PLPFilters,
  type PLPFilterState,
} from "@/features/collection/plp-filters";
import { useInfiniteProducts } from "@/hooks/use-products";

type CollectionPLPProps = {
  slug: string;
  heading: string;
  description?: string;
};

export function CollectionPLP({
  slug,
  heading,
  description,
}: CollectionPLPProps) {
  const [filters, setFilters] = useState<PLPFilterState>({
    tags: [],
    sort: "newest",
  });
  const [mobileFilters, setMobileFilters] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const queryFilters = useMemo(
    () => ({
      collectionSlug: slug,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      tags: filters.tags.length ? filters.tags : undefined,
      sort: filters.sort,
      limit: 8,
    }),
    [slug, filters]
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteProducts(queryFilters);

  const products = data?.pages.flatMap((p) => p.items) ?? [];

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="section-padding">
      <div className="container-page">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {heading}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-muted">{description}</p>
        )}

        <div className="mt-8 flex items-center justify-between lg:hidden">
          <p className="text-sm text-muted">
            {products.length} products
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilters(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          <PLPFilters
            filters={filters}
            onChange={setFilters}
            className="hidden lg:block"
          />

          {mobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-stone-900/40"
                onClick={() => setMobileFilters(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold">Filters</h2>
                  <Button size="sm" onClick={() => setMobileFilters(false)}>
                    Apply
                  </Button>
                </div>
                <PLPFilters filters={filters} onChange={setFilters} />
              </div>
            </div>
          )}

          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-4/5 w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="py-16 text-center text-muted">
                No products match your filters.
              </p>
            ) : (
              <>
                <ProductGrid products={products} columns={3} />
                <div ref={loadMoreRef} className="mt-12 flex justify-center">
                  {isFetchingNextPage && (
                    <Skeleton className="h-10 w-40 rounded-full" />
                  )}
                  {!hasNextPage && products.length > 0 && (
                    <p className="text-sm text-muted">End of results</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
