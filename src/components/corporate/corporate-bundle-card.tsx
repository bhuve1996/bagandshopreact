import Image from "next/image";
import Link from "next/link";
import { giftBundleImageUrl } from "@/lib/product-placeholder";
import { Gift, Package } from "lucide-react";
import { GiftBundleAddToCart } from "@/components/corporate/gift-bundle-add-to-cart";
import { formatPrice } from "@/lib/utils";
import type { CorporateBundle } from "@/types/corporate";

type Props = {
  bundle: CorporateBundle;
  ctaLabel?: string;
  href?: string;
  addToCartLabel?: string;
};

export function CorporateBundleCard({
  bundle,
  ctaLabel = "View bundle",
  href,
  addToCartLabel = "Add set to cart",
}: Props) {
  const isGifting = bundle.kind === "GIFTING";
  const defaultHref = isGifting
    ? `/gifting#${bundle.slug}`
    : `/corporate#${bundle.slug}`;
  const linkHref = href ?? defaultHref;
  const itemCount = bundle.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <article className="card-premium flex flex-col overflow-hidden">
      <Link href={linkHref} className="group relative aspect-4/3 overflow-hidden">
        <Image
          src={giftBundleImageUrl(bundle.image)}
          alt={bundle.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {bundle.tagline ? (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            {bundle.tagline}
          </p>
        ) : null}
        <h3 className="mt-1 text-lg font-semibold tracking-tight">
          <Link href={linkHref} className="hover:underline">
            {bundle.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{bundle.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          {isGifting ? (
            <Gift className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <Package className="h-4 w-4 shrink-0" aria-hidden />
          )}
          <span>
            {itemCount} {itemCount === 1 ? "product" : "products"}
            {isGifting ? " in this set" : ` · Min. ${bundle.minOrderQty} units`}
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg font-semibold">
            {isGifting ? formatPrice(bundle.fromPrice) : `From ${formatPrice(bundle.fromPrice)}`}
          </span>
          {bundle.compareAtPrice && bundle.compareAtPrice > bundle.fromPrice ? (
            <span className="text-sm text-muted line-through">
              {formatPrice(bundle.compareAtPrice)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted">
          {isGifting ? "Gift set price" : "Per kit · bulk pricing on request"}
        </p>
        {isGifting ? (
          <div className="mt-5 space-y-2">
            <GiftBundleAddToCart
              bundle={bundle}
              label={addToCartLabel}
              className="w-full"
            />
            <Link
              href={linkHref}
              className="block text-center text-sm font-medium underline-offset-4 hover:underline"
            >
              View what&apos;s inside →
            </Link>
          </div>
        ) : (
          <Link
            href={linkHref}
            className="mt-5 text-sm font-medium underline-offset-4 hover:underline"
          >
            {ctaLabel} →
          </Link>
        )}
      </div>
    </article>
  );
}
