import { isDatabaseReady } from "@/lib/db-ready";
import { computeOrderTotals } from "@/lib/order-totals";
import { getPrisma } from "@/lib/prisma";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { isDemoAuthAllowed } from "@/lib/security/env";
import {
  decrementStockForItems,
  OrderValidationError,
  validateAndResolveCartItems,
} from "@/lib/validate-cart-items";
import type { CartItem } from "@/types";
import { sendOrderConfirmationEmail } from "@/services/email";
import { markCartRecovered } from "@/services/abandoned-cart";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackEvent } from "@/services/analytics";

export type CreateOrderInput = {
  userId?: string;
  customerEmail?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    name?: string;
    image?: string;
    price?: number;
    slug?: string;
  }>;
  paymentMethod: "RAZORPAY" | "COD" | "UPI";
  couponCode?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  shipping: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
};

function resolvePaymentStatus(input: CreateOrderInput): "PENDING" | "PAID" {
  if (input.paymentMethod === "COD") return "PENDING";
  if (
    input.paymentMethod === "RAZORPAY" &&
    input.razorpayPaymentId &&
    input.razorpayOrderId &&
    input.razorpaySignature
  ) {
    const valid = verifyRazorpaySignature({
      orderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      signature: input.razorpaySignature,
    });
    if (!valid) {
      throw new OrderValidationError("Invalid payment verification");
    }
    return "PAID";
  }
  return "PENDING";
}

export async function createOrder(input: CreateOrderInput) {
  const validatedItems = await validateAndResolveCartItems(
    input.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    }))
  );

  const { subtotal, discount, shipping, tax, total } = await computeOrderTotals(
    validatedItems,
    input.couponCode
  );
  const orderNumber = `BS${Date.now().toString(36).toUpperCase()}`;
  const paymentStatus = resolvePaymentStatus(input);

  let razorpayOrderId = input.razorpayOrderId;
  if (input.paymentMethod === "RAZORPAY" && !razorpayOrderId && paymentStatus === "PENDING") {
    const rz = await createRazorpayOrder({
      amount: total,
      receipt: orderNumber,
    });
    razorpayOrderId = rz?.id;
  }

  if (!(await isDatabaseReady())) {
    if (!isDemoAuthAllowed()) {
      throw new OrderValidationError("Checkout is temporarily unavailable");
    }
    const mockOrder = {
      id: `mock-${orderNumber}`,
      orderNumber,
      status: "PENDING" as const,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "COD" ? "PENDING" : paymentStatus,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      razorpayOrderId,
      mock: true,
    };
    await markCartRecovered(input.userId, input.customerEmail);
    if (input.customerEmail && mockOrder.paymentStatus === "PAID") {
      await sendOrderConfirmationEmail({
        to: input.customerEmail,
        orderNumber,
        total,
        items: validatedItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      });
    }
    return mockOrder;
  }

  await decrementStockForItems(validatedItems);

  const order = await getPrisma().order.create({
    data: {
      orderNumber,
      userId: input.userId,
      customerEmail: input.customerEmail?.toLowerCase(),
      paymentMethod: input.paymentMethod,
      paymentStatus,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      razorpayOrderId,
      couponCode: input.couponCode?.toUpperCase(),
      shippingName: input.shipping.fullName,
      shippingPhone: input.shipping.phone,
      shippingLine1: input.shipping.line1,
      shippingLine2: input.shipping.line2,
      shippingCity: input.shipping.city,
      shippingState: input.shipping.state,
      shippingPincode: input.shipping.pincode,
      items: {
        create: validatedItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true, user: true },
  });

  await markCartRecovered(input.userId, input.customerEmail);

  await trackEvent({
    type: AnalyticsEventType.PURCHASE,
    orderId: order.id,
    userId: input.userId,
    path: "/checkout",
    metadata: {
      total,
      orderNumber,
      itemCount: validatedItems.length,
      paymentMethod: input.paymentMethod,
    },
  });

  const email = input.customerEmail ?? order.user?.email ?? undefined;
  if (email && paymentStatus === "PAID") {
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

  return { ...order, razorpayOrderId };
}

export async function getOrdersForUser(userId: string) {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderByNumber(orderNumber: string, userId?: string) {
  if (!(await isDatabaseReady())) return null;
  return getPrisma().order.findFirst({
    where: {
      orderNumber,
      ...(userId ? { userId } : {}),
    },
    include: { items: true },
  });
}

export async function getOrderForTracking(orderNumber: string, email: string) {
  if (!(await isDatabaseReady())) return null;
  const normalized = email.toLowerCase().trim();
  return getPrisma().order.findFirst({
    where: {
      orderNumber,
      OR: [
        { customerEmail: normalized },
        { user: { email: normalized } },
      ],
    },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      createdAt: true,
    },
  });
}

/** Server-side total for Razorpay checkout (validated cart lines). */
export async function computeCheckoutTotal(
  lines: CreateOrderInput["items"],
  couponCode?: string
): Promise<{ items: CartItem[]; total: number; subtotal: number }> {
  const items = await validateAndResolveCartItems(
    lines.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    }))
  );
  const totals = await computeOrderTotals(items, couponCode);
  return { items, total: totals.total, subtotal: totals.subtotal };
}
