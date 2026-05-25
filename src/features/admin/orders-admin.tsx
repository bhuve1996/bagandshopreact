"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export function OrdersAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () =>
      fetch("/api/admin/orders").then((r) => r.json() as Promise<OrderRow[]>),
  });

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="card-premium overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((o) => (
                <tr key={o.id} className="border-b border-border">
                  <td className="p-4 font-mono text-xs">{o.orderNumber}</td>
                  <td className="p-4">{o.shippingName}</td>
                  <td className="p-4">{formatPrice(o.total)}</td>
                  <td className="p-4">{o.status}</td>
                  <td className="p-4">{o.paymentStatus}</td>
                  <td className="p-4">
                    <select
                      className="rounded border border-border px-2 py-1 text-xs"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {[
                        "PENDING",
                        "CONFIRMED",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                        "CANCELLED",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
