import Image from "next/image";
import Link from "next/link";
import { CorporateBundleCard } from "@/components/corporate/corporate-bundle-card";
import { CorporateInquiryForm } from "@/features/corporate/corporate-inquiry-form";
import { giftBundleImageUrl } from "@/lib/product-placeholder";
import { formatPrice } from "@/lib/utils";
import type { CorporateBundle } from "@/types/corporate";
import type { StorefrontSettings } from "@/types/storefront-settings";

type Props = {
  bundles: CorporateBundle[];
  support: StorefrontSettings["support"];
};

export function CorporatePageView({ bundles, support }: Props) {
  return (
    <div>
      <section className="section-padding border-b border-border bg-stone-100 dark:bg-stone-900/50">
        <div className="container-page max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Corporate gifting
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Packages built for your team & clients
          </h1>
          <p className="mt-4 text-muted leading-relaxed">
            Tell us what you need — we&apos;ll help you build custom bundles,
            bulk pricing, and branded packaging for HR programs, client gifts,
            and events.
          </p>
          <p className="mt-4 text-sm text-muted">
            Shopping for personal gifts?{" "}
            <Link href="/gifting" className="font-medium underline">
              Browse Perfect Gifting sets
            </Link>
            .
          </p>
        </div>
      </section>

      <section
        id="inquiry"
        className="section-padding scroll-mt-24 border-b border-border"
      >
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Contact us to plan your package
            </h2>
            <p className="mt-3 text-muted leading-relaxed">
              Fill in the form and our team will get back to you with a quote,
              timeline, and customization options. You can reference a sample
              bundle below or describe a fully custom mix.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li>· Minimum orders vary by bundle (typically 20–50 units)</li>
              <li>· GST invoice and bulk shipping across India</li>
              <li>· Custom branding and product swaps available</li>
            </ul>
          </div>
          <CorporateInquiryForm bundles={bundles} supportEmail={support.email} />
        </div>
      </section>

      <section className="section-padding" aria-labelledby="sample-bundles">
        <div className="container-page">
          <h2
            id="sample-bundles"
            className="text-2xl font-semibold tracking-tight"
          >
            Sample corporate bundles
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Starting points for your quote — select one in the form above or mix
            your own products.
          </p>
          {bundles.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bundles.map((bundle) => (
                <div key={bundle.id} id={bundle.slug}>
                  <CorporateBundleCard
                    bundle={bundle}
                    ctaLabel="Use in inquiry"
                    href="#inquiry"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">
              No sample bundles yet — use the contact form to describe your needs.
            </p>
          )}
        </div>
      </section>

      {bundles.map((bundle) => (
        <BundleDetailSection key={bundle.id} bundle={bundle} />
      ))}
    </div>
  );
}

function BundleDetailSection({ bundle }: { bundle: CorporateBundle }) {
  return (
    <section
      className="border-t border-border py-12"
      aria-labelledby={`bundle-${bundle.slug}`}
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="relative aspect-square max-w-md overflow-hidden rounded-2xl">
            <Image
              src={giftBundleImageUrl(bundle.image)}
              alt=""
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
          <div>
            <h2
              id={`bundle-${bundle.slug}`}
              className="text-xl font-semibold tracking-tight"
            >
              What&apos;s in {bundle.name}
            </h2>
            <p className="mt-2 text-sm text-muted">{bundle.description}</p>
            <p className="mt-4 text-lg font-semibold">
              From {formatPrice(bundle.fromPrice)}
              <span className="ml-2 text-sm font-normal text-muted">
                · min. {bundle.minOrderQty} kits
              </span>
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
            <Link
              href="#inquiry"
              className="mt-6 inline-block text-sm font-medium underline-offset-4 hover:underline"
            >
              Request quote for this bundle →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
