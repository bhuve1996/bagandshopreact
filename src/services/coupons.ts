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

function calcDiscount(
  subtotal: number,
  type: "PERCENT" | "FIXED",
  value: number
): number {
  if (type === "PERCENT") return Math.round((subtotal * value) / 100);
  return Math.min(value, subtotal);
}

/** Active, non-expired coupons from the database (admin-managed). */
export async function listActiveCoupons(): Promise<PublicCoupon[]> {
  if (!(await isDatabaseReady())) {
    return [];
  }

  const now = new Date();
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

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, message: "Enter a coupon code" };

  if (!(await isDatabaseReady())) {
    return { valid: false, message: "Coupons are unavailable" };
  }

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
