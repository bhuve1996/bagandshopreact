import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

type ProductGridProps = {
  products: Product[];
  columns?: 2 | 3 | 4;
};

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const colClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid gap-x-4 gap-y-10 sm:gap-x-6 ${colClass}`}>
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
