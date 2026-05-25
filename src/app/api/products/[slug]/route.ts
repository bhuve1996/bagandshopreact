import { NextResponse } from "next/server";
import { getProductBySlug, getRelatedProducts } from "@/services/products";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const related = await getRelatedProducts(product);
  return NextResponse.json({ product, related });
}
