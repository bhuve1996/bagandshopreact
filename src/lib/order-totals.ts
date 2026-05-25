import type { CartItem } from "@/types";
import { validateCoupon } from "@/services/coupons";

export const SHIPPING_FREE_THRESHOLD = 999;
export const SHIPPING_COST = 99;
export const TAX_RATE = 0.18;

export type OrderTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
};

export function calcSubtotalAndShipping(items: CartItem[]) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST;
  return { subtotal, shipping };
}

export async function computeOrderTotals(
  items: CartItem[],
  couponCode?: string
): Promise<OrderTotals> {
  const { subtotal, shipping } = calcSubtotalAndShipping(items);
  let discount = 0;
  if (couponCode) {
    const coupon = await validateCoupon(couponCode, subtotal);
    if (coupon.valid) discount = coupon.discount;
  }
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE);
  const total = taxable + shipping + tax;
  return { subtotal, discount, shipping, tax, total };
}
