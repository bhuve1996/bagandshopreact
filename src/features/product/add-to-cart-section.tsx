"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types";

export function AddToCartSection({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-full border border-border">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-4 py-2 text-sm"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-10 text-center text-sm">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="px-4 py-2 text-sm"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <Button
        size="lg"
        className="flex-1"
        data-add-to-cart="primary"
        onClick={() =>
          addItem(
            {
              productId: product.id,
              name: product.name,
              image: product.images[0],
              price: product.price,
              slug: product.slug,
            },
            qty
          )
        }
      >
        Add to cart
      </Button>
      <Button size="lg" variant="outline" className="flex-1">
        Buy now
      </Button>
    </div>
  );
}
