import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateReferralDiscount } from "@/services/referrals";

export async function POST(request: NextRequest) {
  try {
    const { code } = z.object({ code: z.string() }).parse(await request.json());
    const result = await validateReferralDiscount(code);
    if (!result) {
      return NextResponse.json({ valid: false, message: "Invalid referral code" });
    }
    return NextResponse.json({
      valid: true,
      discount: result.discount,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
