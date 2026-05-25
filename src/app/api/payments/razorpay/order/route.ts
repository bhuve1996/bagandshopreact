import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/payments/razorpay";
import { applyRateLimit } from "@/lib/security/rate-limit";
import { computeCheckoutTotal } from "@/services/orders";
import { OrderValidationError } from "@/lib/validate-cart-items";

const lineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(99),
});

const schema = z.object({
  items: z.array(lineSchema).min(1).max(50),
  couponCode: z.string().optional(),
  receipt: z.string().min(1).max(64),
});

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, "razorpay-order", {
    limit: 20,
    windowMs: 60_000,
  });
  if (limited) return limited;

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Razorpay not configured" },
      { status: 503 }
    );
  }
  try {
    const body = schema.parse(await request.json());
    const { total } = await computeCheckoutTotal(body.items, body.couponCode);
    const order = await createRazorpayOrder({
      amount: total,
      receipt: body.receipt,
    });
    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    if (e instanceof OrderValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
