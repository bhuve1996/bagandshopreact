import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/mock-data";

export function FeaturedCategories() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Shop by category
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">
              Find your fit
            </h2>
          </div>
          <Link href="/collections" className="text-sm font-medium underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
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
                  <p className="text-xs text-white/80">{cat.productCount} products</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
