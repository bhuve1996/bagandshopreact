"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminNavItems } from "@/components/admin/admin-nav";
import { StatCard } from "@/components/admin/stat-card";
import { formatPrice } from "@/lib/utils";
import type { DashboardStats } from "@/services/analytics";

export function DashboardView() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () =>
      fetch("/api/admin/analytics").then((r) => r.json() as Promise<DashboardStats>),
  });

  if (isLoading || !data) {
    return <p className="text-muted">Loading dashboard…</p>;
  }

  const maxRev = Math.max(...data.revenueByDay.map((d) => d.revenue), 1);

  const manageLinks = adminNavItems.filter((item) => item.href !== "/admin");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview and quick links to manage the store.</p>
      </div>

      <div className="card-premium p-6">
        <h2 className="text-sm font-semibold">Manage store</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {manageLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-stone-50 dark:hover:bg-stone-900"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (30d)" value={formatPrice(data.revenue)} />
        <StatCard label="Orders" value={String(data.orders)} />
        <StatCard label="AOV" value={formatPrice(data.aov)} />
        <StatCard
          label="Customers"
          value={String(data.customers)}
          hint={`${data.conversionRate.toFixed(1)}% view → purchase`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Product views (30d)"
          value={String(data.engagement.funnel.productViews)}
        />
        <StatCard
          label="Add to cart"
          value={String(data.engagement.funnel.addToCart)}
          hint={`${data.engagement.funnel.viewToCartRate}% of views`}
        />
        <StatCard
          label="Assistant opens"
          value={String(data.engagement.assistant.opens)}
        />
        <StatCard
          label="Abandoned carts"
          value={String(data.engagement.abandonedCarts)}
          hint="Not recovered"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6">
          <h2 className="text-sm font-semibold">Revenue (7 days)</h2>
          <div className="mt-6 flex h-40 items-end gap-2">
            {data.revenueByDay.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-stone-900 dark:bg-stone-200"
                  style={{ height: `${(d.revenue / maxRev) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-muted">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium p-6">
          <h2 className="text-sm font-semibold">Orders by status</h2>
          <ul className="mt-4 space-y-2">
            {data.ordersByStatus.map((s) => (
              <li key={s.status} className="flex justify-between text-sm">
                <span className="text-muted">{s.status}</span>
                <span className="font-medium">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-premium p-6">
        <h2 className="text-sm font-semibold">Top products</h2>
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
