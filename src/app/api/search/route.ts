import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "12");
  const products = await searchProducts(q, limit);
  return NextResponse.json({ products, query: q });
}
