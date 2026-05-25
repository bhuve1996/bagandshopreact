import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCopy } from "@/lib/format-copy";
import type { HomepageSectionCopy, LabelsCopy } from "@/types/storefront-settings";
import type { CategoryShowcaseTile } from "@/services/products";

type Props = {
  categories: CategoryShowcaseTile[];
  section: HomepageSectionCopy;
  labels: LabelsCopy;
};

export function ShopByCategory({ categories, section, labels }: Props) {
  if (categories.length === 0) return null;

  return (
    <section className="section-padding border-y border-border bg-card">
      <div className="container-page">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          align="center"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/collections/${cat.slug}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="card-premium relative aspect-square w-full max-w-[140px] overflow-hidden sm:max-w-none">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
              </div>
              <span className="mt-3 text-xs font-medium sm:text-sm">{cat.name}</span>
              <span className="text-[10px] text-muted sm:text-xs">
                {formatCopy(
                  cat.productCount === 1
                    ? labels.productCount
                    : labels.productsCount,
                  { count: cat.productCount }
                )}
              </span>
            </Link>
          ))}
        </div>
        {section.linkText && section.linkHref ? (
          <p className="mt-10 text-center">
            <Link
              href={section.linkHref}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              {section.linkText}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
