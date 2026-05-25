import { NextResponse } from "next/server";
import { getStorefrontSettings } from "@/services/storefront-settings";

export async function GET() {
  const settings = await getStorefrontSettings();
  return NextResponse.json(settings);
}
