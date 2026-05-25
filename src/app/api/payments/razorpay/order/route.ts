import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/payments/razorpay";

const schema = z.object({
  amount: z.number().min(1),
  receipt: z.string().min(1),
});

export async function POST(request: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Razorpay not configured" },
      { status: 503 }
    );
  }
  try {
    const body = schema.parse(await request.json());
    const order = await createRazorpayOrder(body);
    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
