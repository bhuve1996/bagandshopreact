"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

type OrderItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  product?: { id: string; slug: string };
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  razorpayOrderId: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user: { email: string; name: string | null } | null;
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function OrderDetailAdmin({ orderId }: { orderId: string }) {
  const qc = useQueryClient();
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error("Order not found");
      return res.json() as Promise<OrderDetail>;
    },
  });

  async function patchOrder(body: { status?: string; paymentStatus?: string }) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(err.error ?? "Could not update order");
      return;
    }
    toast.success("Order updated");
    qc.invalidateQueries({ queryKey: ["admin-order", orderId] });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  if (isLoading) {
    return <p className="text-muted">Loading…</p>;
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to orders
          </Link>
        </Button>
        <p className="text-muted">Order not found.</p>
      </div>
    );
  }

  const addressLines = [
    order.shippingLine1,
    order.shippingLine2,
    `${order.shippingCity}, ${order.shippingState} ${order.shippingPincode}`,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orders
            </Link>
          </Button>
          <h1 className="font-mono text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">
            Placed {formatDateTime(order.createdAt)}
            {order.updatedAt !== order.createdAt && (
              <> · Updated {formatDateTime(order.updatedAt)}</>
            )}
          </p>
        </div>
        <p className="text-2xl font-semibold">{formatPrice(order.total)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-premium space-y-4 p-5">
          <h2 className="text-sm font-semibold">Fulfillment</h2>
          <label className="block text-sm">
            <span className="text-muted">Order status</span>
            <select
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
              value={order.status}
              onChange={(e) => patchOrder({ status: e.target.value })}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Payment status</span>
            <select
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
              value={order.paymentStatus}
              onChange={(e) => patchOrder({ paymentStatus: e.target.value })}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Payment method</dt>
              <dd className="font-medium">{order.paymentMethod}</dd>
            </div>
            {order.razorpayOrderId && (
              <div className="sm:col-span-2">
                <dt className="text-muted">Razorpay order ID</dt>
                <dd className="font-mono text-xs">{order.razorpayOrderId}</dd>
              </div>
            )}
            {order.couponCode && (
              <div>
                <dt className="text-muted">Coupon</dt>
                <dd className="font-medium">{order.couponCode}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="card-premium space-y-4 p-5">
          <h2 className="text-sm font-semibold">Customer & shipping</h2>
          {order.user && (
            <div className="text-sm">
              <p className="font-medium">{order.user.name ?? order.shippingName}</p>
              <p className="text-muted">{order.user.email}</p>
              <Link
                href="/admin/users"
                className="mt-1 inline-block text-xs text-accent underline"
              >
                View users
              </Link>
            </div>
          )}
          <div className="text-sm">
            <p className="font-medium">{order.shippingName}</p>
            <p className="text-muted">{order.shippingPhone}</p>
            <address className="mt-2 not-italic text-muted">
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        </section>
      </div>

      <section className="card-premium overflow-x-auto">
        <h2 className="border-b border-border p-4 text-sm font-semibold">Line items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="p-4">Product</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Unit</th>
              <th className="p-4 text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.product?.id && (
                        <Link
                          href={`/admin/products/${item.product.id}`}
                          className="text-xs text-accent underline"
                        >
                          Edit product
                        </Link>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">{item.quantity}</td>
                <td className="p-4">{formatPrice(item.price)}</td>
                <td className="p-4 text-right font-medium">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {order.items.length === 0 && (
          <p className="p-8 text-center text-muted">No line items.</p>
        )}
      </section>

      <section className="card-premium ml-auto max-w-sm p-5 text-sm">
        <h2 className="mb-3 font-semibold">Order summary</h2>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <dt>Discount</dt>
              <dd>−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{formatPrice(order.shipping)}</dd>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">Tax</dt>
              <dd>{formatPrice(order.tax)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
