"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { useCartStore } from "@/store/cart-store";
import type { CorporateBundle } from "@/types/corporate";

type Props = {
  bundle: CorporateBundle;
  label?: string;
  className?: string;
};

export function GiftBundleAddToCart({
  bundle,
  label = "Add set to cart",
  className,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);

  function addBundle() {
    if (bundle.items.length === 0) {
      toast.error("This gift set is empty");
      return;
    }
    for (const item of bundle.items) {
      const image = item.product.images[0] ?? "/products/_placeholders/category.jpg";
      addItem(
        {
          productId: item.product.id,
          name: item.product.name,
          image,
          price: item.product.price,
          slug: item.product.slug,
        },
        item.quantity
      );
    }
    toast.success("Added to cart", `${bundle.name} — all items added`);
  }

  return (
    <Button type="button" size="lg" className={className} onClick={addBundle}>
      {label}
    </Button>
  );
}
