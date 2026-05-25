import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon } from "@/services/coupons";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const result = await validateCoupon(body.code, body.subtotal);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}
