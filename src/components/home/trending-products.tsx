import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageSectionCopy } from "@/types/storefront-settings";
import type { Product } from "@/types";

type Props = {
  products: Product[];
  section: HomepageSectionCopy;
};

export function TrendingProducts({ products, section }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="section-padding bg-accent-muted/50">
      <div className="container-page">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          linkText={section.linkText}
          linkHref={section.linkHref}
        />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
