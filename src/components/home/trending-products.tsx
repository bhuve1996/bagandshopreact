import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { getTrending } from "@/lib/mock-data";

export function TrendingProducts() {
  const products = getTrending();

  return (
    <section className="section-padding bg-accent-muted/50">
      <div className="container-page">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Trending now
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">
              Most loved this week
            </h2>
          </div>
          <Link
            href="/collections/best-sellers"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Shop trending
          </Link>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
