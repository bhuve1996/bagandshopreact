import Link from "next/link";
import { Gift, Heart, Sparkles } from "lucide-react";
import { CorporateBundleCard } from "@/components/corporate/corporate-bundle-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageCopy } from "@/types/storefront-settings";
import type { CorporateBundle } from "@/types/corporate";

type Props = {
  bundles: CorporateBundle[];
  section: HomepageCopy["gifting"];
};

export function PerfectGiftingSection({ bundles, section }: Props) {
  const featured = bundles.filter((b) => b.featured).slice(0, 3);
  const display = featured.length > 0 ? featured : bundles.slice(0, 3);

  return (
    <section className="section-padding">
      <div className="container-page">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          linkText={section.linkText}
          linkHref={section.linkHref ?? "/gifting"}
        />
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
            <p className="text-sm text-muted">Curated sets — no guesswork</p>
          </div>
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <Gift className="h-5 w-5 shrink-0" aria-hidden />
            <p className="text-sm text-muted">Add the full bundle to cart</p>
          </div>
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <Heart className="h-5 w-5 shrink-0" aria-hidden />
            <p className="text-sm text-muted">Ideal for personal gifting</p>
          </div>
        </div>
        {display.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {display.map((bundle) => (
              <CorporateBundleCard
                key={bundle.id}
                bundle={bundle}
                addToCartLabel={section.ctaText}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Gift sets coming soon.{" "}
            <Link href="/collections" className="underline">
              Browse the shop
            </Link>
            .
          </p>
        )}
        <div className="mt-10">
          <Button size="lg" variant="outline" asChild>
            <Link href="/gifting">View all gift sets</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
