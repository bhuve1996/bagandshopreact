"use client";

import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/admin/stat-card";
import { analyticsEventLabel } from "@/lib/analytics-events";
import { formatPrice } from "@/lib/utils";
import type { DashboardStats } from "@/services/analytics";

export function AnalyticsAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () =>
      fetch("/api/admin/analytics").then(
        (r) => r.json() as Promise<DashboardStats>
      ),
  });

  if (isLoading || !data) {
    return <p className="text-muted">Loading analytics…</p>;
  }

  const e = data.engagement;
  const { funnel } = e;
  const maxPageViews = Math.max(
    ...e.pageViewsByDay.map((d) => d.count),
    1
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted">
          Last 30 days — commerce from orders, engagement from storefront events.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (paid)" value={formatPrice(data.revenue)} />
        <StatCard label="Paid orders" value={String(data.paidOrders)} />
        <StatCard
          label="Product views"
          value={String(funnel.productViews)}
        />
        <StatCard
          label="View → purchase"
          value={`${funnel.viewToPurchaseRate}%`}
          hint={`${funnel.purchases} purchases`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6">
          <h2 className="text-sm font-semibold">Conversion funnel</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <FunnelRow label="Product views" value={funnel.productViews} />
            <FunnelRow
              label="Add to cart"
              value={funnel.addToCart}
              rate={funnel.viewToCartRate}
              rateLabel="of views"
            />
            <FunnelRow label="Checkout started" value={funnel.beginCheckout} />
            <FunnelRow
              label="Purchases"
              value={funnel.purchases}
              rate={funnel.cartToPurchaseRate}
              rateLabel="of carts"
            />
          </ul>
        </div>

        <div className="card-premium p-6">
          <h2 className="text-sm font-semibold">Page views (7 days)</h2>
          <div className="mt-6 flex h-40 items-end gap-2">
            {e.pageViewsByDay.map((d) => (
              <div
                key={d.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-t bg-stone-700 dark:bg-stone-300"
                  style={{
                    height: `${(d.count / maxPageViews) * 100}%`,
                    minHeight: 4,
                  }}
                />
                <span className="text-[10px] text-muted">{d.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Events by type</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="pb-2">Event</th>
                <th className="pb-2 text-right">Count</th>
              </tr>
            </thead>
            <tbody>
              {e.eventsByType.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-4 text-muted">
                    No events yet — browse the storefront to collect data.
                  </td>
                </tr>
              ) : (
                e.eventsByType.map((row) => (
                  <tr key={row.type} className="border-t border-border">
                    <td className="py-2">{analyticsEventLabel(row.type)}</td>
                    <td className="py-2 text-right font-medium">{row.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card-premium space-y-6 p-6">
          <div>
            <h2 className="text-sm font-semibold">Shop assistant</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted">Opens</span>
                <span>{e.assistant.opens}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted">Messages</span>
                <span>{e.assistant.messages}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted">Quick replies</span>
                <span>{e.assistant.quickReplies}</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Abandoned carts</h2>
            <p className="mt-2 text-2xl font-semibold">{e.abandonedCarts}</p>
            <p className="text-xs text-muted">Not recovered (30d)</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6">
          <h2 className="text-sm font-semibold">Most viewed products</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="pb-2">Product</th>
                <th className="pb-2 text-right">Views</th>
              </tr>
            </thead>
            <tbody>
              {e.topViewedProducts.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-4 text-muted">
                    No product views tracked yet.
                  </td>
                </tr>
              ) : (
                e.topViewedProducts.map((p) => (
                  <tr key={p.productId} className="border-t border-border">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2 text-right">{p.views}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card-premium p-6">
          <h2 className="text-sm font-semibold">Product shares by channel</h2>
          <ul className="mt-4 space-y-2">
            {e.shareByChannel.length === 0 ? (
              <li className="text-sm text-muted">No shares recorded yet.</li>
            ) : (
              e.shareByChannel.map((s) => (
                <li key={s.channel} className="flex justify-between text-sm">
                  <span className="capitalize text-muted">{s.channel}</span>
                  <span className="font-medium">{s.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="card-premium p-6">
        <h2 className="text-sm font-semibold">Top products by revenue</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-2">Product</th>
              <th className="pb-2">Units</th>
              <th className="pb-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts.map((p) => (
              <tr key={p.name} className="border-t border-border">
                <td className="py-2">{p.name}</td>
                <td className="py-2">{p.units}</td>
                <td className="py-2 text-right">{formatPrice(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  rate,
  rateLabel,
}: {
  label: string;
  value: number;
  rate?: number;
  rateLabel?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="font-medium tabular-nums">
        {value.toLocaleString()}
        {rate !== undefined && rateLabel && (
          <span className="ml-2 text-xs font-normal text-muted">
            ({rate}% {rateLabel})
          </span>
        )}
      </span>
    </li>
  );
}
