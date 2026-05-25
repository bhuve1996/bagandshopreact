"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { buildProductBreadcrumbs } from "@/lib/breadcrumbs";
import { Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductGallery } from "@/features/product/product-gallery";
import { ProductAccordion } from "@/features/product/product-accordion";
import { ProductTags } from "@/components/product/product-tags";
import { DeliveryPromise } from "@/features/product/delivery-promise";
import { ProductExcitingOffers } from "@/features/product/product-exciting-offers";
import { StorefrontTrustBenefits } from "@/components/store/storefront-trust-benefits";
import { ProductHelpActions } from "@/features/product/product-help-actions";
import { ProductShare } from "@/components/share/product-share";
import { StickyPurchaseBar } from "@/features/product/sticky-purchase-bar";
import { AddToCartSection } from "@/features/product/add-to-cart-section";
import { FrequentlyBought } from "@/features/product/frequently-bought";
import { ProductReviews } from "@/features/product/product-reviews";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { ProductGrid } from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackAnalytics } from "@/lib/analytics-client";
import type { ProductVariant } from "@/types";

function pickDefaultVariant(
  variants: ProductVariant[] | undefined
): ProductVariant | null {
  if (!variants?.length) return null;
  return variants.find((v) => v.inStock) ?? variants[0];
}

export function ProductDetail({ slug }: { slug: string }) {
  const { data, isLoading, error } = useProduct(slug);
  const addRecent = useRecentlyViewedStore((s) => s.add);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  const product = data?.product;
  const related = data?.related ?? [];
  const frequentlyBought = data?.frequentlyBought ?? [];
  const wishlisted = product ? wishlistIds.includes(product.id) : false;

  useEffect(() => {
    if (slug) addRecent(slug);
  }, [slug, addRecent]);

  useEffect(() => {
    if (product) {
      setSelectedVariant(pickDefaultVariant(product.variants));
    }
  }, [product?.id, product?.variants]);

  useEffect(() => {
    if (!product) return;
    trackAnalytics({
      type: AnalyticsEventType.PRODUCT_VIEW,
      productId: product.id,
      path: `/products/${product.slug}`,
      metadata: { slug: product.slug, name: product.name },
    });
  }, [product?.id, product?.slug, product?.name]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const base = [...product.images];
    const variantImg = selectedVariant?.image;
    if (variantImg && !base.includes(variantImg)) {
      return [variantImg, ...base];
    }
    return base;
  }, [product, selectedVariant]);

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayCompare =
    selectedVariant?.compareAtPrice ?? product?.compareAtPrice;
  const hasMultipleVariants = (product?.variants?.length ?? 0) > 1;
  const showContent = !isLoading && !error && product && data;

  if (isLoading) {
    return (
      <div
        className="section-padding container-page"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading product</span>
        <Skeleton className="aspect-4/5 w-full max-w-lg rounded-2xl" aria-hidden />
      </div>
    );
  }

  if (!showContent) {
    return (
      <div className="section-padding container-page text-center">
        <p className="text-muted">Product not found.</p>
        <Link href="/collections" className="mt-4 inline-block text-sm underline">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding pb-24 lg:pb-16">
      <div className="container-page">
        <Breadcrumbs
          className="mb-8"
          items={buildProductBreadcrumbs(product)}
        />

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={galleryImages} name={product.name} />
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-semibold tracking-tight">
                {product.name}
              </h1>
              <button
                type="button"
                onClick={() => {
                  const added = !wishlisted;
                  toggleWishlist(product.id);
                  toast.wishlist(added, product.name);
                  trackAnalytics({
                    type: added
                      ? AnalyticsEventType.WISHLIST_ADD
                      : AnalyticsEventType.WISHLIST_REMOVE,
                    productId: product.id,
                    metadata: { slug: product.slug },
                  });
                }}
                className="rounded-full p-2 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
                aria-label={
                  wishlisted
                    ? `Remove ${product.name} from wishlist`
                    : `Add ${product.name} to wishlist`
                }
                aria-pressed={wishlisted}
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    wishlisted && "fill-red-500 text-red-500"
                  )}
                  aria-hidden
                />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-semibold">
                {hasMultipleVariants && !selectedVariant
                  ? `From ${formatPrice(displayPrice)}`
                  : formatPrice(displayPrice)}
              </span>
              {displayCompare && displayCompare > displayPrice && (
                <span className="text-lg text-muted line-through">
                  {formatPrice(displayCompare)}
                </span>
              )}
            </div>
            {selectedVariant?.sku && (
              <p className="mt-1 text-xs text-muted">SKU: {selectedVariant.sku}</p>
            )}
            <p className="mt-2 text-sm text-muted">
              <span className="text-amber-600" aria-hidden>
                ★
              </span>
              <span className="sr-only">Rated </span>
              {product.rating} out of 5
              <span className="sr-only">, </span>
              <span aria-hidden> · </span>
              {product.reviewCount}{" "}
              {product.reviewCount === 1 ? "review" : "reviews"}
            </p>
            <ProductTags tags={product.tags} />
            <ProductExcitingOffers />
            <DeliveryPromise />
            <AddToCartSection
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
            <ProductShare
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
            />
            <ProductHelpActions
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
            />
            <StorefrontTrustBenefits placement="pdp" className="mt-8" />
            <ProductAccordion
              description={product.description}
              faqs={product.faqs}
            />
          </div>
        </div>

        <ProductReviews slug={product.slug} />
        <FrequentlyBought products={frequentlyBought} />
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
        productName={product.name}
        price={displayPrice}
        onAddToCart={() => {
          document
            .querySelector<HTMLButtonElement>('[data-add-to-cart="primary"]')
            ?.click();
        }}
      />
    </div>
  );
}
