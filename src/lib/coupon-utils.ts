export function formatCouponOffer(c: {
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: number;
}): string {
  const off = c.type === "PERCENT" ? `${c.value}% off` : `₹${c.value} off`;
  const min = c.minOrder > 0 ? ` · Min order ₹${c.minOrder}` : "";
  return `${off}${min}`;
}
