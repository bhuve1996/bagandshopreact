import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { getBestsellers } from "@/lib/mock-data";

export function BestSellers() {
  const products = getBestsellers();

  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Best sellers
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">
            Customer favorites
          </h2>
        </div>
        <ProductGrid products={products.length ? products : []} columns={3} />
        <div className="mt-12 text-center">
          <Link
            href="/collections/best-sellers"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            View all best sellers
          </Link>
        </div>
      </div>
    </section>
  );
}
