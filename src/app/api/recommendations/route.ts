import { NextRequest, NextResponse } from "next/server";
import {
  getFrequentlyBoughtTogether,
  getRecommendations,
} from "@/services/recommendations";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const bundle = searchParams.get("bundle") === "true";

  if (bundle && slug) {
    const products = await getFrequentlyBoughtTogether(slug);
    return NextResponse.json({ products });
  }

  const products = await getRecommendations({
    productSlug: slug,
    category,
    limit: Number(searchParams.get("limit") ?? "4"),
  });
  return NextResponse.json({ products });
}
