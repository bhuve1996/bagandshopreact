"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/types";

export function FrequentlyBought({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ["bundle", slug],
    queryFn: () =>
      fetch(`/api/recommendations?slug=${slug}&bundle=true`).then(
        (r) => r.json() as Promise<{ products: Product[] }>
      ),
  });

  const products = data?.products ?? [];
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-16">
      <h2 className="mb-8 text-xl font-semibold tracking-tight">
        Frequently bought together
      </h2>
      <ProductGrid products={products} columns={3} />
    </section>
  );
}
