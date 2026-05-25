"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  isNew: boolean;
  isBestseller: boolean;
  images: string[];
  category?: { name: string; slug: string };
  collection?: { name: string; slug: string } | null;
  collectionSlug?: string | null;
  _count?: { variants: number };
};

export function ProductsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () =>
      fetch("/api/admin/products").then((r) => r.json() as Promise<ProductRow[]>),
  });

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete “${name}”?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete product");
      return;
    }
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted">
            Manage catalog — edit prices, variants, flags, and images.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="card-premium overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Variants</th>
                <th className="p-4">Flags</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-b border-border">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.images[0] && (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                          <Image
                            src={p.images[0]}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">
                    {p.category?.name ?? "—"}
                    {p.collectionSlug && (
                      <span className="mt-0.5 block text-[10px]">
                        → {p.collectionSlug}
                      </span>
                    )}
                  </td>
                  <td className="p-4">{formatPrice(p.price)}</td>
                  <td className="p-4">{p._count?.variants ?? 0}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {p.isNew && (
                        <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] dark:bg-stone-700">
                          New
                        </span>
                      )}
                      {p.isBestseller && (
                        <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px]">
                          Best
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="mr-3 text-xs font-medium hover:underline"
                    >
                      Edit
                    </Link>
                    <a
                      href={`/products/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-3 text-xs text-muted hover:underline"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data ?? []).length === 0 && (
            <p className="p-8 text-center text-sm text-muted">
              No products. Run <code className="text-xs">npm run db:sync</code> or add
              one manually.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
