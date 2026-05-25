import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  adminDeleteProduct,
  adminGetProduct,
  adminUpdateProduct,
} from "@/services/admin";
import { syncProductsToAlgolia } from "@/lib/search";
import { getAllProductsForSearch } from "@/services/products";

type Props = { params: Promise<{ id: string }> };

const variantSchema = z.object({
  id: z.string().optional(),
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

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().nullable().optional(),
  images: z.array(z.string()).min(1).optional(),
  hoverImage: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().min(0).optional(),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  device: z.string().nullable().optional(),
  categoryId: z.string().optional(),
  collectionSlug: z.string().nullable().optional(),
  variants: z.array(variantSchema).optional(),
  faqs: z.array(faqSchema).optional(),
});

export async function GET(_req: NextRequest, { params }: Props) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  const product = await adminGetProduct(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    const body = patchSchema.parse(await request.json());
    const product = await adminUpdateProduct(id, body);
    const all = await getAllProductsForSearch();
    await syncProductsToAlgolia(all).catch(() => {});
    return NextResponse.json(product);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    await adminDeleteProduct(id);
    const all = await getAllProductsForSearch();
    await syncProductsToAlgolia(all).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
