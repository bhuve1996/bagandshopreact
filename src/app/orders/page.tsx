"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
};

export default function OrdersPage() {
  const { status } = useSession();
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [status]);

  if (status === "loading") {
    return <div className="section-padding container-page">Loading…</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="section-padding container-page text-center">
        <p className="text-muted">Please sign in to view orders.</p>
        <Link href="/login" className="mt-4 inline-block underline">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-page max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        {orders.length === 0 ? (
          <p className="mt-8 text-muted">No orders yet.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="card-premium flex justify-between p-4">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted">{o.status}</p>
                </div>
                <p className="font-semibold">{formatPrice(o.total)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
