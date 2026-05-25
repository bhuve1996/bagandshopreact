import { NextResponse } from "next/server";
import { getFrequentlyBoughtTogether } from "@/services/recommendations";
import { getProductBySlug, getRelatedProducts } from "@/services/products";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const related = await getRelatedProducts(product);
  const frequentlyBought = await getFrequentlyBoughtTogether(
    slug,
    related.map((p) => p.id)
  );
  return NextResponse.json({ product, related, frequentlyBought });
}
