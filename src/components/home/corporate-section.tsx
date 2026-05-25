import Link from "next/link";
import { Building2, Gift, Package } from "lucide-react";
import { CorporateBundleCard } from "@/components/corporate/corporate-bundle-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageCopy } from "@/types/storefront-settings";
import type { CorporateBundle } from "@/types/corporate";

type Props = {
  bundles: CorporateBundle[];
  section: HomepageCopy["corporate"];
};

export function CorporateSection({ bundles, section }: Props) {
  const featured = bundles.filter((b) => b.featured).slice(0, 3);
  const display = featured.length > 0 ? featured : bundles.slice(0, 3);

  return (
    <section className="section-padding bg-stone-50 dark:bg-stone-900/40">
      <div className="container-page">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          linkText={section.linkText}
          linkHref={section.linkHref ?? "/corporate"}
        />
        <div className="mb-10 grid gap-6 sm:grid-cols-3">
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <Gift className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">Sample bundles</p>
              <p className="mt-0.5 text-xs text-muted">
                Start from curated kits or mix your own products.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <Package className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">Custom packaging</p>
              <p className="mt-0.5 text-xs text-muted">
                Branded boxes, inserts, and note cards on request.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <Building2 className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">Dedicated support</p>
              <p className="mt-0.5 text-xs text-muted">
                We help you plan quantities, timelines, and delivery.
              </p>
            </div>
          </div>
        </div>
        {display.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {display.map((bundle) => (
              <CorporateBundleCard
                key={bundle.id}
                bundle={bundle}
                ctaLabel="View sample"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Sample bundles are being prepared.{" "}
            <Link href="/corporate" className="underline">
              Contact us
            </Link>{" "}
            to build a custom package.
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/corporate#inquiry">{section.ctaText}</Link>
          </Button>
          <Link
            href="/corporate"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Corporate page & contact form →
          </Link>
        </div>
      </div>
    </section>
  );
}
