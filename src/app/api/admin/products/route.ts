import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  adminCreateProduct,
  adminListProducts,
} from "@/services/admin";
import { syncProductsToAlgolia } from "@/lib/search";
import { getProducts } from "@/services/products";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const products = await adminListProducts();
  return NextResponse.json(products);
}

const createSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().min(0),
  compareAtPrice: z.number().optional(),
  images: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  categoryId: z.string(),
  stock: z.number().optional(),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const body = createSchema.parse(await request.json());
    const product = await adminCreateProduct(body);
    const all = await getProducts({ limit: 100, page: 1 });
    await syncProductsToAlgolia(all.items).catch(() => {});
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
