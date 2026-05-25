import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageSectionCopy } from "@/types/storefront-settings";
import type { Product } from "@/types";

type Props = {
  products: Product[];
  section: HomepageSectionCopy;
};

export function BestSellers({ products, section }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-page">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          align="center"
        />
        <ProductGrid products={products} columns={3} />
        {section.linkText && section.linkHref ? (
          <div className="mt-12 text-center">
            <Link
              href={section.linkHref}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              {section.linkText}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
