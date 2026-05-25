import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  adminCreateProduct,
  adminListProducts,
} from "@/services/admin";
import { syncProductsToAlgolia } from "@/lib/search";
import { getAllProductsForSearch } from "@/services/products";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const products = await adminListProducts();
  return NextResponse.json(products);
}

const variantSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  image: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().optional(),
  stock: z.number().min(0),
  sku: z.string().optional(),
});

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const createSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  price: z.number().min(0),
  compareAtPrice: z.number().optional(),
  images: z.array(z.string()).min(1),
  hoverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  categoryId: z.string(),
  stock: z.number().optional(),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  device: z.string().optional(),
  collectionSlug: z.string().optional(),
  variants: z.array(variantSchema).optional(),
  faqs: z.array(faqSchema).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const body = createSchema.parse(await request.json());
    const product = await adminCreateProduct(body);
    const all = await getAllProductsForSearch();
    await syncProductsToAlgolia(all).catch(() => {});
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
