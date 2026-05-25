"use client";

import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/types";

export function FrequentlyBought({ products }: { products: Product[] }) {
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
