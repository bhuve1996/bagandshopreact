import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCategories, getCollections } from "@/services/products";

export const metadata: Metadata = {
  title: "Shop all collections",
  description: "Browse categories and curated collections at Bag & Shop.",
};

export default async function CollectionsIndexPage() {
  const [categories, collections] = await Promise.all([
    getCategories(),
    getCollections(),
  ]);

  return (
    <div className="section-padding">
      <div className="container-page">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Shop all
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Explore categories and curated collections.
        </p>

        <section className="mt-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Categories
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className="card-premium group overflow-hidden"
              >
                <div className="relative aspect-4/5 bg-stone-100 dark:bg-stone-800">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{cat.name}</h3>
                  <p className="mt-1 text-sm text-muted">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Curated collections
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="card-premium group overflow-hidden"
              >
                <div className="relative aspect-16/10 bg-stone-100 dark:bg-stone-800">
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{col.name}</h3>
                  <p className="mt-1 text-sm text-muted">{col.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 flex flex-wrap gap-3">
          <Link
            href="/collections/best-sellers"
            className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Best sellers
          </Link>
          <Link
            href="/collections/new-arrivals"
            className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            New arrivals
          </Link>
        </section>
      </div>
    </div>
  );
}
