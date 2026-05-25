import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCopy } from "@/lib/format-copy";
import type { HomepageSectionCopy, LabelsCopy } from "@/types/storefront-settings";
import type { Category } from "@/types";

type Props = {
  categories: Category[];
  section: HomepageSectionCopy;
  labels: LabelsCopy;
};

export function FeaturedCategories({ categories, section, labels }: Props) {
  if (categories.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-page">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          linkText={section.linkText}
          linkHref={section.linkHref}
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/collections/${cat.slug}`}
              className="group card-premium overflow-hidden"
            >
              <div className="relative aspect-3/4 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <div className="gradient-fade-bottom absolute inset-0" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-semibold">{cat.name}</h3>
                  <p className="text-xs text-white/80">
                    {formatCopy(
                      cat.productCount === 1
                        ? labels.productCount
                        : labels.productsCount,
                      { count: cat.productCount }
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
