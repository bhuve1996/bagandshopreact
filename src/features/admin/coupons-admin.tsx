"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  active: boolean;
};

export function CouponsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () =>
      fetch("/api/admin/coupons").then((r) => r.json() as Promise<Coupon[]>),
  });
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FIXED",
    value: "",
    minOrder: "500",
  });

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder),
      }),
    });
    setForm({ code: "", type: "PERCENT", value: "", minOrder: "500" });
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Coupons</h1>
      <form onSubmit={createCoupon} className="card-premium flex flex-wrap gap-3 p-4">
        <input
          placeholder="CODE"
          required
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          className="h-10 rounded-lg border border-border px-3 text-sm"
        />
        <select
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value as "PERCENT" | "FIXED" }))
          }
          className="h-10 rounded-lg border border-border px-3 text-sm"
        >
          <option value="PERCENT">Percent</option>
          <option value="FIXED">Fixed</option>
        </select>
        <input
          type="number"
          placeholder="Value"
          required
          value={form.value}
          onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          className="h-10 w-24 rounded-lg border border-border px-3 text-sm"
        />
        <input
          type="number"
          placeholder="Min order"
          value={form.minOrder}
          onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
          className="h-10 w-28 rounded-lg border border-border px-3 text-sm"
        />
        <Button type="submit">Add</Button>
      </form>
      <ul className="space-y-2">
        {(data ?? []).map((c) => (
          <li
            key={c.id}
            className="card-premium flex items-center justify-between p-4 text-sm"
          >
            <span>
              <strong>{c.code}</strong> — {c.type} {c.value}
              {c.type === "PERCENT" ? "%" : "₹"} · min ₹{c.minOrder}
            </span>
            <button
              type="button"
              onClick={() => toggle(c.id, !c.active)}
              className={`text-xs ${c.active ? "text-green-700" : "text-muted"}`}
            >
              {c.active ? "Active" : "Inactive"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
