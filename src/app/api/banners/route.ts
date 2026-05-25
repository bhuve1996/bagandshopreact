import { NextResponse } from "next/server";
import { getActiveBanners } from "@/services/banners";

export async function GET() {
  const banners = await getActiveBanners("homepage");
  return NextResponse.json(banners);
}
