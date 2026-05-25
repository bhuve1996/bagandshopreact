"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";

type TrackResult = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
};

export function TrackOrderView() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get("order")?.trim();
    if (fromUrl) setOrderNumber(fromUrl);
  }, [searchParams]);

  async function track(e?: React.FormEvent) {
    e?.preventDefault();
    const normalized = orderNumber.trim();
    const normalizedEmail = email.trim();
    if (!normalized || !normalizedEmail) {
      setError("Enter your order number and the email used at checkout.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/track?order=${encodeURIComponent(normalized)}&email=${encodeURIComponent(normalizedEmail)}`
      );
      if (!res.ok) {
        const msg = "Order not found. Check the number and try again.";
        setError(msg);
        toast.error("Order not found", msg);
        return;
      }
      const data = (await res.json()) as TrackResult;
      setResult(data);
      toast.success("Order found", data.orderNumber);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-padding">
      <div className="container-page max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Track order</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your order number and the email used at checkout (confirmation email).
        </p>
        <form onSubmit={track} className="card-premium mt-8 space-y-4 p-6">
          <label className="block">
            <span className="text-xs text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 h-11 w-full rounded-xl border border-border px-4 text-sm"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Order number</span>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="BS..."
              className="mt-1 h-11 w-full rounded-xl border border-border px-4 text-sm"
            />
          </label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Looking up…" : "Track"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {result && (
            <div className="rounded-xl bg-accent-muted p-4 text-sm">
              <p className="font-mono font-medium">{result.orderNumber}</p>
              <p className="mt-2 text-muted">
                Status: <span className="text-foreground">{result.status}</span>
              </p>
              <p className="text-muted">Payment: {result.paymentStatus}</p>
              <p className="mt-2 font-semibold">{formatPrice(result.total)}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
