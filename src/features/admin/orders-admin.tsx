"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  shippingName: string;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(iso)
  );
}

export function OrdersAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () =>
      fetch("/api/admin/orders").then((r) => r.json() as Promise<OrderRow[]>),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-muted">
          View order details, line items, shipping address, and update status or payment.
        </p>
      </div>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="card-premium overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="p-4">Order</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((o) => (
                <tr key={o.id} className="border-b border-border">
                  <td className="p-4">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-xs font-medium underline-offset-2 hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="p-4">{o.shippingName}</td>
                  <td className="p-4">{formatPrice(o.total)}</td>
                  <td className="p-4">{o.status}</td>
                  <td className="p-4">{o.paymentStatus}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-xs font-medium text-accent underline-offset-2 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data ?? []).length === 0 && (
            <p className="p-8 text-center text-muted">No orders in database yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
