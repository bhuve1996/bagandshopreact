import crypto from "crypto";

export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

export async function createRazorpayOrder(params: {
  amount: number;
  currency?: string;
  receipt: string;
}) {
  if (!isRazorpayConfigured()) return null;

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount * 100,
      currency: params.currency ?? "INR",
      receipt: params.receipt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[razorpay]", err);
    return null;
  }

  return res.json() as Promise<{
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  }>;
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;
  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expected === params.signature;
}
