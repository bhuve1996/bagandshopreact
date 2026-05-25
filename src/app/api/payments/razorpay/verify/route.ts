import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { isDatabaseReady } from "@/lib/db-ready";
import {
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from "@/lib/payments/razorpay";
import { sendOrderConfirmationEmail } from "@/services/email";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  orderNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  try {
    const body = schema.parse(await request.json());
    const valid = verifyRazorpaySignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (await isDatabaseReady()) {
      const order = await getPrisma().order.findFirst({
        where: {
          OR: [
            { razorpayOrderId: body.razorpay_order_id },
            ...(body.orderNumber ? [{ orderNumber: body.orderNumber }] : []),
          ],
        },
        include: { items: true, user: true },
      });
      if (order) {
        await getPrisma().order.update({
          where: { id: order.id },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        });
        const email = order.user?.email;
        if (email) {
          await sendOrderConfirmationEmail({
            to: email,
            orderNumber: order.orderNumber,
            total: order.total,
            items: order.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              price: i.price,
            })),
          });
        }
      }
    }

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
