import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { applyRateLimit } from "@/lib/security/rate-limit";
import { OrderValidationError } from "@/lib/validate-cart-items";
import { createOrder, getOrdersForUser } from "@/services/orders";

const createSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      name: z.string().optional(),
      image: z.string().optional(),
      price: z.number().optional(),
      quantity: z.number().min(1).max(99),
      slug: z.string().optional(),
    })
  ),
  paymentMethod: z.enum(["RAZORPAY", "COD", "UPI"]),
  couponCode: z.string().optional(),
  customerEmail: z.string().email().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  shipping: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(10),
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(6),
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await getOrdersForUser(session.user.id);
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, "orders-create", {
    limit: 15,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);
    const body = createSchema.parse(await request.json());
    const order = await createOrder({
      ...body,
      userId: session?.user?.id,
      customerEmail: body.customerEmail ?? session?.user?.email ?? undefined,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    if (e instanceof OrderValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
