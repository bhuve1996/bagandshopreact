"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  href: string;
  active: boolean;
};

export function BannersAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () =>
      fetch("/api/admin/banners").then((r) => r.json() as Promise<Banner[]>),
  });
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    href: "/collections",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", subtitle: "", image: "", href: "/collections" });
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  async function remove(id: string) {
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Banners (CMS)</h1>
      <form onSubmit={handleSubmit} className="card-premium grid gap-3 p-4 sm:grid-cols-2">
        <input
          placeholder="Title"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm"
        />
        <input
          placeholder="Subtitle"
          value={form.subtitle}
          onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm"
        />
        <input
          placeholder="Image URL"
          required
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm sm:col-span-2"
        />
        <input
          placeholder="Link href"
          required
          value={form.href}
          onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm"
        />
        <Button type="submit">Save banner</Button>
      </form>
      <ul className="space-y-3">
        {(data ?? []).map((b) => (
          <li key={b.id} className="card-premium flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{b.title}</p>
              <p className="text-xs text-muted">{b.href}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(b.id)}
              className="text-xs text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
