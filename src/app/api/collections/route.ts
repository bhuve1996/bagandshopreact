import { NextResponse } from "next/server";
import { getCollections } from "@/services/products";

export async function GET() {
  const collections = await getCollections();
  return NextResponse.json(collections);
}
