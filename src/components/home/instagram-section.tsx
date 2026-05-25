import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageCopy } from "@/types/storefront-settings";

type Props = {
  images: string[];
  section: HomepageCopy["instagram"];
};

export function InstagramSection({ images, section }: Props) {
  if (images.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-page">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          linkText={section.linkText}
          linkHref={section.linkHref}
          align="center"
        />
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="200px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
