import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageCopy, LabelsCopy } from "@/types/storefront-settings";
import type { Collection } from "@/types";

type Props = {
  collections: Collection[];
  section: HomepageCopy["collections"];
  labels: LabelsCopy;
};

export function CollectionsShowcase({ collections, section, labels }: Props) {
  if (collections.length === 0) return null;

  const featured = collections.slice(0, 3);
  const exploreCta = section.exploreCta || labels.exploreCollection;

  return (
    <section className="section-padding">
      <div className="container-page space-y-6">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          className="mb-0"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {featured.map((col, i) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className={`group relative overflow-hidden rounded-2xl ${
                i === 0 ? "lg:col-span-2 lg:row-span-1" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${
                  i === 0 ? "aspect-video" : "aspect-4/5 lg:aspect-3/4"
                }`}
              >
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes={i === 0 ? "66vw" : "33vw"}
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-900/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {col.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">{col.description}</p>
                  <span className="mt-4 inline-block text-sm font-medium underline-offset-4 group-hover:underline">
                    {exploreCta}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
