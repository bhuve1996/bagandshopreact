import Image from "next/image";
import Link from "next/link";
import { CorporateBundleCard } from "@/components/corporate/corporate-bundle-card";
import { GiftBundleAddToCart } from "@/components/corporate/gift-bundle-add-to-cart";
import { formatPrice } from "@/lib/utils";
import type { CorporateBundle } from "@/types/corporate";

type Props = {
  bundles: CorporateBundle[];
};

export function GiftingPageView({ bundles }: Props) {
  return (
    <div>
      <section className="section-padding border-b border-border bg-stone-100 dark:bg-stone-900/50">
        <div className="container-page max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Perfect gifting
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Gift sets, ready when you are
          </h1>
          <p className="mt-4 text-muted leading-relaxed">
            Shop curated bundles for birthdays, housewarmings, and everyday
            surprises. Each set includes multiple products — add everything to
            your cart in one click, or explore what&apos;s inside before you buy.
          </p>
        </div>
      </section>

      <section className="section-padding" aria-labelledby="gift-sets">
        <div className="container-page">
          <h2 id="gift-sets" className="text-2xl font-semibold tracking-tight">
            Gift bundles
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            For bulk or branded orders for your company, see{" "}
            <Link href="/corporate" className="font-medium underline">
              corporate gifting
            </Link>{" "}
            and use the contact form there.
          </p>
          {bundles.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bundles.map((bundle) => (
                <div key={bundle.id} id={bundle.slug}>
                  <CorporateBundleCard bundle={bundle} />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">
              No gift sets published yet.{" "}
              <Link href="/collections" className="underline">
                Shop individual products
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      {bundles.map((bundle) => (
        <GiftingBundleDetail key={bundle.id} bundle={bundle} />
      ))}
    </div>
  );
}

function GiftingBundleDetail({ bundle }: { bundle: CorporateBundle }) {
  return (
    <section
      className="border-t border-border py-12"
      aria-labelledby={`gift-${bundle.slug}`}
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="relative aspect-square max-w-md overflow-hidden rounded-2xl">
            <Image
              src={bundle.image}
              alt=""
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
          <div>
            <h2
              id={`gift-${bundle.slug}`}
              className="text-xl font-semibold tracking-tight"
            >
              {bundle.name}
            </h2>
            {bundle.tagline ? (
              <p className="mt-1 text-sm text-muted">{bundle.tagline}</p>
            ) : null}
            <p className="mt-3 text-sm text-muted">{bundle.description}</p>
            <p className="mt-4 text-lg font-semibold">
              {formatPrice(bundle.fromPrice)}
              {bundle.compareAtPrice &&
              bundle.compareAtPrice > bundle.fromPrice ? (
                <span className="ml-2 text-sm font-normal text-muted line-through">
                  {formatPrice(bundle.compareAtPrice)}
                </span>
              ) : null}
            </p>
            <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
              {bundle.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-medium hover:underline"
                  >
                    {item.product.name}
                    {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                  </Link>
                  <span className="shrink-0 text-muted">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <GiftBundleAddToCart bundle={bundle} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
