"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  className?: string;
};

export function ProductCard({ product, priority, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wishlisted = useWishlistStore((s) => s.has(product.id));
  const discount =
    product.compareAtPrice &&
    product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100
        )
      : null;

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
              New
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
            toggleWishlist(product.id);
          }}
          className="absolute right-3 top-12 z-20 rounded-full bg-white/90 p-2 shadow-sm transition-opacity hover:bg-white"
          aria-label="Wishlist"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              wishlisted && "fill-red-500 text-red-500"
            )}
          />
        </button>
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-3 right-3 z-20 h-10 w-10 translate-y-2 opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            addItem({
              productId: product.id,
              name: product.name,
              image: product.images[0],
              price: product.price,
              slug: product.slug,
            });
          }}
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus className="h-4 w-4" />
        </Button>
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <span className="text-amber-600">★</span>
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
      </div>
    </motion.article>
  );
}
