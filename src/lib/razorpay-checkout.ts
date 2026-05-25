import { siteConfig } from "@/lib/site-content";
import type { CartItem } from "@/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(params: {
  items: CartItem[];
  couponCode?: string;
  receipt: string;
  name: string;
  email?: string;
  phone?: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
}) {
  const res = await fetch("/api/payments/razorpay/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: params.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      couponCode: params.couponCode,
      receipt: params.receipt,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Razorpay unavailable");
  }
  const data = await res.json();
  await loadRazorpayScript();

  const rzp = new window.Razorpay!({
    key: data.key,
    amount: data.amount,
    currency: data.currency,
    name: siteConfig.name,
    description: `Order ${params.receipt}`,
    order_id: data.orderId,
    prefill: {
      name: params.name,
      email: params.email,
      contact: params.phone,
    },
    handler: params.onSuccess,
    theme: { color: "#1c1917" },
  });
  rzp.open();
}
