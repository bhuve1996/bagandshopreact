import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

export type CouponResult =
  | { valid: true; code: string; discount: number; type: "PERCENT" | "FIXED" }
  | { valid: false; message: string };

export type PublicCoupon = {
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: number;
};

const MOCK_COUPONS: Record<string, { type: "PERCENT" | "FIXED"; value: number; minOrder: number }> = {
  WELCOME10: { type: "PERCENT", value: 10, minOrder: 500 },
  FLAT200: { type: "FIXED", value: 200, minOrder: 1500 },
};

function calcDiscount(
  subtotal: number,
  type: "PERCENT" | "FIXED",
  value: number
): number {
  if (type === "PERCENT") return Math.round((subtotal * value) / 100);
  return Math.min(value, subtotal);
}

/** Active, non-expired coupons available store-wide at checkout. */
export async function listActiveCoupons(): Promise<PublicCoupon[]> {
  const now = new Date();

  if (await isDatabaseReady()) {
    const rows = await getPrisma().coupon.findMany({
      where: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        code: true,
        description: true,
        type: true,
        value: true,
        minOrder: true,
      },
    });
    return rows;
  }

  return Object.entries(MOCK_COUPONS).map(([code, c]) => ({
    code,
    description: null,
    type: c.type,
    value: c.value,
    minOrder: c.minOrder,
  }));
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, message: "Enter a coupon code" };

  if (await isDatabaseReady()) {
    const coupon = await getPrisma().coupon.findUnique({ where: { code: normalized } });
    if (!coupon || !coupon.active) {
      return { valid: false, message: "Invalid or expired coupon" };
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, message: "Coupon has expired" };
    }
    if (subtotal < coupon.minOrder) {
      return {
        valid: false,
        message: `Minimum order ₹${coupon.minOrder} required`,
      };
    }
    const discount = calcDiscount(subtotal, coupon.type, coupon.value);
    return {
      valid: true,
      code: normalized,
      discount,
      type: coupon.type,
    };
  }

  const mock = MOCK_COUPONS[normalized];
  if (!mock) return { valid: false, message: "Invalid coupon code" };
  if (subtotal < mock.minOrder) {
    return { valid: false, message: `Minimum order ₹${mock.minOrder} required` };
  }
  return {
    valid: true,
    code: normalized,
    discount: calcDiscount(subtotal, mock.type, mock.value),
    type: mock.type,
  };
}
