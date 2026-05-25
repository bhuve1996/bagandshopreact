"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type TrackResult = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");

  async function track(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const res = await fetch(
      `/api/orders/track?order=${encodeURIComponent(orderNumber)}`
    );
    if (!res.ok) {
      setError("Order not found. Check the number and try again.");
      return;
    }
    setResult(await res.json());
  }

  return (
    <div className="section-padding">
      <div className="container-page max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Track order</h1>
        <form onSubmit={track} className="card-premium mt-8 space-y-4 p-6">
          <label className="block">
            <span className="text-xs text-muted">Order number</span>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="BS..."
              className="mt-1 h-11 w-full rounded-xl border border-border px-4 text-sm"
            />
          </label>
          <Button type="submit" className="w-full">
            Track
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {result && (
            <div className="rounded-xl bg-accent-muted p-4 text-sm">
              <p className="font-mono font-medium">{result.orderNumber}</p>
              <p className="mt-2 text-muted">
                Status: <span className="text-foreground">{result.status}</span>
              </p>
              <p className="text-muted">
                Payment: {result.paymentStatus}
              </p>
              <p className="mt-2 font-semibold">{formatPrice(result.total)}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
