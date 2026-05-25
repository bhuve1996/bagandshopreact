"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { StockNotifyForm } from "@/features/product/stock-notify-form";
import { VariantSelector } from "@/features/product/variant-selector";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackAnalytics } from "@/lib/analytics-client";
import { toast } from "@/lib/toast";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";
import { useCartStore } from "@/store/cart-store";
import type { Product, ProductVariant } from "@/types";

function resolveDefaultVariant(product: Product): ProductVariant | null {
  const variants = product.variants?.filter((v) => v.inStock) ?? [];
  if (variants.length === 0) return product.variants?.[0] ?? null;
  return variants[0];
}

type AddToCartSectionProps = {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
};

export function AddToCartSection({
  product,
  selectedVariant,
  onVariantChange,
}: AddToCartSectionProps) {
  const { labels } = useStorefrontCopy();
  const [qty, setQty] = useState(1);
  const qtyLabelId = useId();
  const addItem = useCartStore((s) => s.addItem);

  const variants = product.variants ?? [];
  const active =
    selectedVariant ?? resolveDefaultVariant(product);
  const displayPrice = active?.price ?? product.price;
  const displayCompare = active?.compareAtPrice ?? product.compareAtPrice;
  const displayImage =
    active?.image ?? product.images[0] ?? product.hoverImage ?? "";
  const outOfStock =
    active?.inStock === false && variants.length > 0;

  function addToCart(buyNow = false) {
    if (!active) {
      toast.error("Out of stock", "Choose another option or check back later.");
      return;
    }
    if (active.inStock === false && variants.length > 0) {
      toast.error("Out of stock", "This variant is currently unavailable.");
      return;
    }
    addItem(
      {
        productId: product.id,
        variantId: variants.length > 0 ? active.id : undefined,
        name:
          variants.length > 1
            ? `${product.name} — ${active.name}`
            : product.name,
        image: displayImage,
        price: displayPrice,
        slug: product.slug,
      },
      qty
    );
    toast.addedToCart(
      variants.length > 1 ? `${product.name} — ${active.name}` : product.name,
      qty
    );
    trackAnalytics({
      type: AnalyticsEventType.ADD_TO_CART,
      productId: product.id,
      metadata: {
        slug: product.slug,
        quantity: qty,
        buyNow,
        variantId: active.id,
        price: displayPrice,
      },
    });
    if (buyNow) {
      window.location.href = "/checkout";
    }
  }

  return (
    <div className="mt-8">
      {variants.length > 0 && active && (
        <VariantSelector
          variants={variants}
          selectedId={active.id}
          onSelect={onVariantChange}
        />
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          role="group"
          aria-labelledby={qtyLabelId}
          className="flex items-center rounded-full border border-border"
        >
          <span id={qtyLabelId} className="sr-only">
            Quantity
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
            aria-label="Decrease quantity"
            disabled={qty <= 1}
          >
            −
          </button>
          <span
            className="w-10 text-center text-sm tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">Quantity: </span>
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button
          size="lg"
          className="flex-1"
          data-add-to-cart="primary"
          disabled={!active?.inStock && variants.length > 0}
          onClick={() => addToCart(false)}
        >
          {active?.inStock === false ? labels.outOfStock : labels.addToCart}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={() => addToCart(true)}
          aria-label={`Buy ${product.name} now`}
        >
          Buy now
        </Button>
      </div>

      {displayCompare && displayCompare > displayPrice && (
        <p className="mt-2 text-xs text-muted">
          You save {Math.round(((displayCompare - displayPrice) / displayCompare) * 100)}%
        </p>
      )}

      {outOfStock && <StockNotifyForm productSlug={product.slug} />}
    </div>
  );
}
