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
  amount: number;
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
    body: JSON.stringify({ amount: params.amount, receipt: params.receipt }),
  });
  if (!res.ok) throw new Error("Razorpay unavailable");
  const data = await res.json();
  await loadRazorpayScript();

  const rzp = new window.Razorpay!({
    key: data.key,
    amount: data.amount,
    currency: data.currency,
    name: "Bag & Shop",
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
