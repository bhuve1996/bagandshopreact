"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ProductForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    price: "",
    images: "",
    tags: "",
    categoryId: "",
    stock: "100",
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: form.slug,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        categoryId: form.categoryId,
        stock: Number(form.stock),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to create product");
      return;
    }
    router.push("/admin/products");
  }

  return (
    <form onSubmit={handleSubmit} className="card-premium max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-semibold">New product</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {(
        [
          ["slug", "Slug", "text"],
          ["name", "Name", "text"],
          ["description", "Description", "text"],
          ["price", "Price (INR)", "number"],
          ["stock", "Stock", "number"],
        ] as const
      ).map(([key, label, type]) => (
        <label key={key} className="block">
          <span className="text-xs text-muted">{label}</span>
          <input
            required={key !== "description"}
            type={type}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
        </label>
      ))}
      <label className="block">
        <span className="text-xs text-muted">Category</span>
        <select
          required
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
        >
          <option value="">Select…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs text-muted">Image URLs (one per line)</span>
        <textarea
          required
          value={form.images}
          onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
          rows={3}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs text-muted">Tags (comma-separated)</span>
        <input
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Create product"}
      </Button>
    </form>
  );
}
