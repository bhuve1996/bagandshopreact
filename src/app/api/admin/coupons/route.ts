import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { adminCreateCoupon, adminListCoupons, adminToggleCoupon } from "@/services/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  return NextResponse.json(await adminListCoupons());
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const body = z
      .object({
        code: z.string(),
        type: z.enum(["PERCENT", "FIXED"]),
        value: z.number(),
        minOrder: z.number().optional(),
        description: z.string().optional(),
      })
      .parse(await request.json());
    const coupon = await adminCreateCoupon(body);
    return NextResponse.json(coupon, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const body = z.object({ id: z.string(), active: z.boolean() }).parse(await request.json());
    const coupon = await adminToggleCoupon(body.id, body.active);
    return NextResponse.json(coupon);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
