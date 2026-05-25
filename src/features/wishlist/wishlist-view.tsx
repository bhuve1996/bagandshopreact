"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/product/product-grid";
import { fetchProducts } from "@/lib/api-client";
import { useWishlistStore } from "@/store/wishlist-store";

export function WishlistView() {
  const ids = useWishlistStore((s) => s.ids);
  const { data } = useQuery({
    queryKey: ["wishlist-products", ids],
    queryFn: () => fetchProducts({ limit: 100, page: 1 }),
    enabled: ids.length > 0,
  });

  const products = useMemo(
    () => data?.items.filter((p) => ids.includes(p.id)) ?? [],
    [data, ids]
  );

  if (ids.length === 0) {
    return (
      <p className="py-16 text-center text-muted">
        Your wishlist is empty.{" "}
        <Link href="/collections" className="underline">
          Browse products
        </Link>
      </p>
    );
  }

  return <ProductGrid products={products} />;
}
