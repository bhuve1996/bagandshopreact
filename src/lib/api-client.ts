import type { PaginatedProducts } from "@/services/products";
import type { Category, Collection, Product } from "@/types";

const base = "";

export async function fetchProducts(
  params: Record<string, string | number | boolean | undefined>
): Promise<PaginatedProducts> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") search.set(k, String(v));
  });
  const res = await fetch(`${base}/api/products?${search}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(slug: string) {
  const res = await fetch(`${base}/api/products/${slug}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json() as Promise<{ product: Product; related: Product[] }>;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${base}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch(`${base}/api/collections`);
  if (!res.ok) throw new Error("Failed to fetch collections");
  return res.json();
}

export type PublicCoupon = {
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: number;
};

export async function fetchActiveCouponsApi(): Promise<PublicCoupon[]> {
  const res = await fetch(`${base}/api/coupons`);
  if (!res.ok) throw new Error("Failed to fetch coupons");
  return res.json();
}

export async function validateCouponApi(code: string, subtotal: number) {
  const res = await fetch(`${base}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });
  return res.json();
}

export async function createOrderApi(payload: unknown) {
  const res = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Order failed");
  }
  return res.json();
}
