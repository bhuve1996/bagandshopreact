import { NextResponse } from "next/server";
import { listActiveCoupons } from "@/services/coupons";

export async function GET() {
  const coupons = await listActiveCoupons();
  return NextResponse.json(coupons);
}
