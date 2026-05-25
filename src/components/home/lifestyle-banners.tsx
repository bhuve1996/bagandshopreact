import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const banners = [
  {
    title: "Work From Anywhere",
    subtitle: "Desk & carry essentials for the modern nomad",
    href: "/collections/work-anywhere",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Gift Something Beautiful",
    subtitle: "Curated sets ready to delight",
    href: "/collections/gift-sets",
    image:
      "https://images.unsplash.com/photo-1549465220-1a0b3a0e5c0e?auto=format&fit=crop&w=1200&q=80",
  },
];

export function LifestyleBanners() {
  return (
    <section className="section-padding">
      <div className="container-page grid gap-6 md:grid-cols-2">
        {banners.map((banner) => (
          <div
            key={banner.title}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-4/3">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-stone-900/40" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <p className="text-xs uppercase tracking-widest text-white/80">
                  {banner.subtitle}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  {banner.title}
                </h3>
                <Button variant="secondary" className="mt-6 w-fit" asChild>
                  <Link href={banner.href}>Discover</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
