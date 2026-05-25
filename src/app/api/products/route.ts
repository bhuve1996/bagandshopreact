import { NextRequest, NextResponse } from "next/server";
import { getProducts, type ProductFilters } from "@/services/products";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tags = searchParams.get("tags");

  const filters: ProductFilters = {
    category: searchParams.get("category") ?? undefined,
    collection: searchParams.get("collection") ?? undefined,
    collectionSlug: searchParams.get("collectionSlug") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    device: searchParams.get("device") ?? undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    tags: tags ? tags.split(",") : undefined,
    isBestseller: searchParams.get("bestseller") === "true" || undefined,
    isNew: searchParams.get("new") === "true" || undefined,
    sort: (searchParams.get("sort") as ProductFilters["sort"]) ?? undefined,
    page: Number(searchParams.get("page") ?? "1"),
    limit: Number(searchParams.get("limit") ?? "12"),
  };

  const data = await getProducts(filters);
  return NextResponse.json(data);
}
