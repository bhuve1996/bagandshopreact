"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCardVariantSwatches } from "@/components/product/product-card-variant-swatches";
import {
  formatProductPrice,
  getDefaultVariant,
  getProductPriceDisplay,
} from "@/lib/product-variant-display";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackAnalytics } from "@/lib/analytics-client";
import { toast } from "@/lib/toast";
import { cn, formatPrice } from "@/lib/utils";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  className?: string;
};

export function ProductCard({ product, priority, className }: ProductCardProps) {
  const { labels } = useStorefrontCopy();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wishlisted = useWishlistStore((s) => s.has(product.id));
  const priceDisplay = getProductPriceDisplay(product);
  const defaultVariant = getDefaultVariant(product);
  const discount =
    priceDisplay.compareAtPrice &&
    priceDisplay.compareAtPrice > priceDisplay.fromPrice
      ? Math.round(
          ((priceDisplay.compareAtPrice - priceDisplay.fromPrice) /
            priceDisplay.compareAtPrice) *
            100
        )
      : null;
  const variantCount = product.variants?.length ?? 0;
  const outOfStock =
    defaultVariant?.inStock === false && variantCount > 0;

  function handlePurchase(buyNow = false) {
    if (outOfStock) {
      toast.error("Out of stock", "This variant is currently unavailable.");
      return;
    }
    const v = defaultVariant;
    addItem({
      productId: product.id,
      variantId: v?.id,
      name:
        v && variantCount > 1 ? `${product.name} — ${v.name}` : product.name,
      image: v?.image ?? product.images[0],
      price: v?.price ?? priceDisplay.fromPrice,
      slug: product.slug,
    });
    toast.addedToCart(product.name);
    trackAnalytics({
      type: AnalyticsEventType.ADD_TO_CART,
      productId: product.id,
      metadata: { slug: product.slug, source: "card", buyNow },
    });
    if (buyNow) {
      window.location.href = "/checkout";
    }
  }

  return (
    <motion.article
      layout
      className={cn("group flex flex-col", className)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-premium relative aspect-4/5 overflow-hidden bg-stone-100 dark:bg-stone-800">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10">
          <span className="sr-only">{product.name}</span>
        </Link>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          priority={priority}
        />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden
          />
        )}
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              {labels.newBadge}
            </span>
          )}
          {product.isBestseller && (
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-900">
              {labels.bestsellerBadge}
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-stone-900">
              -{discount}%
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            const added = !wishlisted;
            toggleWishlist(product.id);
            toast.wishlist(added, product.name);
            trackAnalytics({
              type: added
                ? AnalyticsEventType.WISHLIST_ADD
                : AnalyticsEventType.WISHLIST_REMOVE,
              productId: product.id,
              metadata: { slug: product.slug, source: "card" },
            });
          }}
          className="absolute right-3 top-12 z-20 rounded-full bg-white/90 p-2 shadow-sm transition-opacity hover:bg-white"
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              wishlisted && "fill-red-500 text-red-500"
            )}
          />
        </button>
      </div>
      <div className="mt-4 space-y-1">
        {product.device && (
          <p className="text-xs text-muted">{product.device}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium tracking-tight transition-colors hover:text-muted">
            {product.name}
          </h3>
        </Link>
        <ProductCardVariantSwatches product={product} className="mt-2" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatProductPrice(product)}
          </span>
          {priceDisplay.compareAtPrice && (
            <span className="text-xs text-muted line-through">
              {formatPrice(priceDisplay.compareAtPrice)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <span className="text-amber-600">★</span>
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="min-w-0 flex-1 px-3"
            disabled={outOfStock}
            onClick={(e) => {
              e.preventDefault();
              handlePurchase(false);
            }}
          >
            {outOfStock ? labels.outOfStock : labels.addToCart}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-w-0 flex-1 px-3"
            disabled={outOfStock}
            onClick={(e) => {
              e.preventDefault();
              handlePurchase(true);
            }}
            aria-label={`Buy ${product.name} now`}
          >
            Buy now
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
