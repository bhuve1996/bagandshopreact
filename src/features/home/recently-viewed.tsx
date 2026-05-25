"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/product/product-grid";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import type { Product } from "@/types";

export function RecentlyViewed() {
  const slugs = useRecentlyViewedStore((s) => s.slugs);

  const { data } = useQuery({
    queryKey: ["recently-viewed", slugs],
    queryFn: async () => {
      const products: Product[] = [];
      for (const slug of slugs.slice(0, 4)) {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const j = await res.json();
          products.push(j.product);
        }
      }
      return products;
    },
    enabled: slugs.length > 0,
  });

  if (!data?.length) return null;

  return (
    <section className="section-padding border-t border-border">
      <div className="container-page">
        <h2 className="text-2xl font-semibold tracking-tight">Recently viewed</h2>
        <div className="mt-8">
          <ProductGrid products={data} columns={4} />
        </div>
      </div>
    </section>
  );
}
