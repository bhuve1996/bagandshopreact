import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import type { CartItem } from "@/types";
import { validateCoupon } from "@/services/coupons";
import { sendOrderConfirmationEmail } from "@/services/email";
import { markCartRecovered } from "@/services/abandoned-cart";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackEvent } from "@/services/analytics";

const SHIPPING_FREE_THRESHOLD = 999;
const SHIPPING_COST = 99;
const TAX_RATE = 0.18;

export type CreateOrderInput = {
  userId?: string;
  customerEmail?: string;
  items: CartItem[];
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

function calcTotals(items: CartItem[], couponCode?: string) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping =
    subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST;
  return { subtotal, shipping };
}

export async function createOrder(input: CreateOrderInput) {
  const { subtotal, shipping } = calcTotals(input.items, input.couponCode);
  let discount = 0;
  if (input.couponCode) {
    const coupon = await validateCoupon(input.couponCode, subtotal);
    if (coupon.valid) discount = coupon.discount;
  }
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE);
  const total = taxable + shipping + tax;
  const orderNumber = `BS${Date.now().toString(36).toUpperCase()}`;

  let razorpayOrderId = input.razorpayOrderId;
  if (input.paymentMethod === "RAZORPAY" && !razorpayOrderId) {
    const rz = await createRazorpayOrder({
      amount: total,
      receipt: orderNumber,
    });
    razorpayOrderId = rz?.id;
  }

  if (!(await isDatabaseReady())) {
    const mockOrder = {
      id: `mock-${orderNumber}`,
      orderNumber,
      status: "PENDING" as const,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "COD" ? "PENDING" : "PAID",
      subtotal,
      discount,
      shipping,
      tax,
      total,
      razorpayOrderId,
      mock: true,
    };
    await markCartRecovered(input.userId, input.customerEmail);
    if (input.customerEmail) {
      await sendOrderConfirmationEmail({
        to: input.customerEmail,
        orderNumber,
        total,
        items: input.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      });
    }
    return mockOrder;
  }

  const paymentStatus =
    input.paymentMethod === "COD"
      ? "PENDING"
      : input.razorpayPaymentId
        ? "PAID"
        : "PENDING";

  const order = await getPrisma().order.create({
    data: {
      orderNumber,
      userId: input.userId,
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
        create: input.items.map((item) => ({
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
      itemCount: input.items.length,
      paymentMethod: input.paymentMethod,
    },
  });

  const email =
    input.customerEmail ?? order.user?.email ?? undefined;
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
