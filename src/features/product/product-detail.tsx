"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductGallery } from "@/features/product/product-gallery";
import { ProductAccordion } from "@/features/product/product-accordion";
import { StickyPurchaseBar } from "@/features/product/sticky-purchase-bar";
import { AddToCartSection } from "@/features/product/add-to-cart-section";
import { FrequentlyBought } from "@/features/product/frequently-bought";
import { ProductReviews } from "@/features/product/product-reviews";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { useEffect } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

export function ProductDetail({ slug }: { slug: string }) {
  const { data, isLoading, error } = useProduct(slug);
  const addRecent = useRecentlyViewedStore((s) => s.add);
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  useEffect(() => {
    if (slug) addRecent(slug);
  }, [slug, addRecent]);

  if (isLoading) {
    return (
      <div className="section-padding container-page">
        <Skeleton className="aspect-4/5 w-full max-w-lg rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="section-padding container-page text-center">
        <p className="text-muted">Product not found.</p>
        <Link href="/collections" className="mt-4 inline-block text-sm underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const { product, related } = data;
  const wishlisted = useWishlistStore((s) => s.has(product.id));

  return (
    <div className="section-padding pb-24 lg:pb-16">
      <div className="container-page">
        <nav className="mb-8 text-sm text-muted">
          <Link href="/">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${product.category}`}>
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-semibold tracking-tight">
                {product.name}
              </h1>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    wishlisted && "fill-red-500 text-red-500"
                  )}
                />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-semibold">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-muted line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-muted">
              <span className="text-amber-600">★ {product.rating}</span>
              <span>({product.reviewCount} reviews)</span>
            </div>
            <AddToCartSection product={product} />
            <ProductAccordion description={product.description} />
          </div>
        </div>

        <ProductReviews slug={product.slug} />
        <FrequentlyBought slug={product.slug} />
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-8 text-2xl font-semibold tracking-tight">
              You may also like
            </h2>
            <ProductGrid products={related} columns={4} />
          </section>
        )}
      </div>

      <StickyPurchaseBar
        product={product}
        onAddToCart={() => {
          const btn = document.querySelector<HTMLButtonElement>(
            '[data-add-to-cart="primary"]'
          );
          btn?.click();
        }}
      />
    </div>
  );
}
