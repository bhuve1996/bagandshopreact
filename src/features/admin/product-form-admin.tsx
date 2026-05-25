"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

type MediaPickerTarget =
  | { field: "images" }
  | { field: "hover" }
  | { field: "og" }
  | { field: "variant"; variantIndex: number };

function parseImageLines(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

type CategoryOption = { id: string; name: string; slug: string };

export type VariantFormRow = {
  name: string;
  color: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  sku: string;
  image: string;
};

const emptyVariant = (): VariantFormRow => ({
  name: "Standard",
  color: "",
  price: "",
  compareAtPrice: "",
  stock: "100",
  sku: "",
  image: "",
});

const COLLECTION_OPTIONS = [
  { slug: "", label: "None" },
  { slug: "best-sellers", label: "Best Sellers" },
  { slug: "new-arrivals", label: "New Arrivals" },
  { slug: "work-anywhere", label: "Work From Anywhere" },
  { slug: "gift-sets", label: "Gift Sets" },
];

type ProductFormAdminProps = {
  productId?: string;
};

export function ProductFormAdmin({ productId }: ProductFormAdminProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [variants, setVariants] = useState<VariantFormRow[]>([]);
  const [mediaPicker, setMediaPicker] = useState<MediaPickerTarget | null>(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    images: "",
    hoverImage: "",
    tags: "",
    categoryId: "",
    stock: "100",
    device: "",
    collectionSlug: "",
    isNew: false,
    isBestseller: false,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((rows: CategoryOption[]) => setCategories(rows))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/admin/products/${productId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((p) => {
        setForm({
          slug: p.slug,
          name: p.name,
          description: p.description ?? "",
          price: String(p.price),
          compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
          images: (p.images as string[]).join("\n"),
          hoverImage: p.hoverImage ?? "",
          tags: (p.tags as string[]).join(", "),
          categoryId: p.categoryId,
          stock: String(p.stock ?? 100),
          device: p.device ?? "",
          collectionSlug: p.collectionSlug ?? "",
          isNew: p.isNew ?? false,
          isBestseller: p.isBestseller ?? false,
          metaTitle: p.metaTitle ?? "",
          metaDescription: p.metaDescription ?? "",
          ogImage: p.ogImage ?? "",
        });
        setVariants(
          p.variants?.length
            ? p.variants.map(
                (v: {
                  name: string;
                  color?: string | null;
                  price: number;
                  compareAtPrice?: number | null;
                  stock: number;
                  sku?: string | null;
                  image?: string | null;
                }) => ({
                  name: v.name,
                  color: v.color ?? "",
                  price: String(v.price),
                  compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : "",
                  stock: String(v.stock),
                  sku: v.sku ?? "",
                  image: v.image ?? "",
                })
              )
            : []
        );
      })
      .catch(() => setError("Could not load product"))
      .finally(() => setLoading(false));
  }, [productId]);

  function buildPayload() {
    const images = form.images.split("\n").map((s) => s.trim()).filter(Boolean);
    const variantPayload = variants
      .filter((v) => v.name.trim() && v.price.trim())
      .map((v) => ({
        name: v.name.trim(),
        color: v.color.trim() || undefined,
        image: v.image.trim() || undefined,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        stock: Number(v.stock) || 0,
        sku: v.sku.trim() || undefined,
      }));

    return {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      images,
      hoverImage: form.hoverImage.trim() || undefined,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      categoryId: form.categoryId,
      stock: Number(form.stock),
      device: form.device.trim() || undefined,
      collectionSlug: form.collectionSlug || null,
      isNew: form.isNew,
      isBestseller: form.isBestseller,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      ogImage: form.ogImage.trim() || null,
      variants: isEdit
        ? variantPayload
        : variantPayload.length > 0
          ? variantPayload
          : undefined,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = buildPayload();
    const url = isEdit
      ? `/api/admin/products/${productId}`
      : "/api/admin/products";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      const msg = j.error ?? "Failed to save";
      setError(msg);
      toast.error("Could not save product", msg);
      return;
    }
    toast.success(isEdit ? "Product updated" : "Product created");
    router.push("/admin/products");
    router.refresh();
  }

  if (loading) {
    return <p className="text-muted">Loading product…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {isEdit ? "Edit product" : "New product"}
        </h1>
        <Link href="/admin/products" className="text-sm text-muted hover:underline">
          ← Back to products
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="card-premium space-y-4 p-6">
        <h2 className="text-sm font-semibold">Basics</h2>
        {!isEdit && (
          <label className="block">
            <span className="text-xs text-muted">Slug (URL)</span>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </label>
        )}
        {isEdit && (
          <p className="text-sm text-muted">
            Slug: <span className="font-mono text-foreground">{form.slug}</span>
          </p>
        )}
        <label className="block">
          <span className="text-xs text-muted">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={5}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-muted">Base price (INR)</span>
            <input
              required
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Compare-at price (INR)</span>
            <input
              type="number"
              min={0}
              value={form.compareAtPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, compareAtPrice: e.target.value }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Stock</span>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Device label (optional)</span>
            <input
              value={form.device}
              onChange={(e) => setForm((f) => ({ ...f, device: e.target.value }))}
              placeholder="e.g. iPhone 15"
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6">
        <h2 className="text-sm font-semibold">SEO (optional)</h2>
        <p className="text-xs text-muted">
          Override search and social previews. Leave blank to use product name,
          description, and first gallery image.
        </p>
        <label className="block">
          <span className="text-xs text-muted">Meta title</span>
          <input
            value={form.metaTitle}
            onChange={(e) =>
              setForm((f) => ({ ...f, metaTitle: e.target.value }))
            }
            placeholder={form.name || "Product name"}
            className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Meta description</span>
          <textarea
            value={form.metaDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, metaDescription: e.target.value }))
            }
            rows={3}
            placeholder="Short summary for Google (~160 characters)"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">OG image URL (social share)</span>
          <div className="mt-1 flex gap-2">
            <input
              value={form.ogImage}
              onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))}
              placeholder="/products/slug/hero.jpg or https://…"
              className="h-10 min-w-0 flex-1 rounded-lg border border-border px-3 text-sm font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMediaPicker({ field: "og" })}
            >
              Gallery
            </Button>
          </div>
        </label>
      </section>

      <section className="card-premium space-y-4 p-6">
        <h2 className="text-sm font-semibold">Catalog</h2>
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
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted">Marketing collection</span>
          <select
            value={form.collectionSlug}
            onChange={(e) =>
              setForm((f) => ({ ...f, collectionSlug: e.target.value }))
            }
            className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
          >
            {COLLECTION_OPTIONS.map((o) => (
              <option key={o.slug || "none"} value={o.slug}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted">Tags (comma-separated)</span>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) =>
                setForm((f) => ({ ...f, isNew: e.target.checked }))
              }
            />
            New arrival
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isBestseller}
              onChange={(e) =>
                setForm((f) => ({ ...f, isBestseller: e.target.checked }))
              }
            />
            Best seller
          </label>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Images</h2>
          <Link href="/admin/media" className="text-xs underline text-muted">
            Open media gallery
          </Link>
        </div>
        <p className="text-xs text-muted">
          Upload in the gallery or pick existing product/import images — no need to type paths by hand.
        </p>
        {parseImageLines(form.images).length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {parseImageLines(form.images).map((url) => (
              <li
                key={url}
                className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        ) : null}
        <label className="block">
          <span className="text-xs text-muted">Gallery URLs (one per line)</span>
          <textarea
            required
            value={form.images}
            onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
            rows={4}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
          />
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMediaPicker({ field: "images" })}
        >
          Add from gallery
        </Button>
        <label className="block">
          <span className="text-xs text-muted">Hover image URL (optional)</span>
          <div className="mt-1 flex gap-2">
            <input
              value={form.hoverImage}
              onChange={(e) => setForm((f) => ({ ...f, hoverImage: e.target.value }))}
              className="h-10 min-w-0 flex-1 rounded-lg border border-border px-3 text-sm font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMediaPicker({ field: "hover" })}
            >
              Gallery
            </Button>
          </div>
        </label>
      </section>

      <section className="card-premium space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Variants</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVariants((v) => [...v, emptyVariant()])}
          >
            Add variant
          </Button>
        </div>
        {variants.length === 0 ? (
          <p className="text-xs text-muted">
            No variants — base price applies. Add variants for size/color options.
          </p>
        ) : (
          <ul className="space-y-4">
            {variants.map((v, i) => (
              <li
                key={i}
                className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2"
              >
                <input
                  placeholder="Variant name"
                  value={v.name}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], name: e.target.value };
                    setVariants(next);
                  }}
                  className="h-9 rounded-lg border border-border px-2 text-sm sm:col-span-2"
                />
                <input
                  placeholder="Color"
                  value={v.color}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], color: e.target.value };
                    setVariants(next);
                  }}
                  className="h-9 rounded-lg border border-border px-2 text-sm"
                />
                <input
                  placeholder="Price (INR)"
                  type="number"
                  value={v.price}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], price: e.target.value };
                    setVariants(next);
                  }}
                  className="h-9 rounded-lg border border-border px-2 text-sm"
                />
                <input
                  placeholder="Compare-at"
                  type="number"
                  value={v.compareAtPrice}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], compareAtPrice: e.target.value };
                    setVariants(next);
                  }}
                  className="h-9 rounded-lg border border-border px-2 text-sm"
                />
                <input
                  placeholder="Stock"
                  type="number"
                  value={v.stock}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], stock: e.target.value };
                    setVariants(next);
                  }}
                  className="h-9 rounded-lg border border-border px-2 text-sm"
                />
                <input
                  placeholder="SKU"
                  value={v.sku}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...next[i], sku: e.target.value };
                    setVariants(next);
                  }}
                  className="h-9 rounded-lg border border-border px-2 text-sm"
                />
                <div className="flex gap-2 sm:col-span-2">
                  <input
                    placeholder="Image path / URL"
                    value={v.image}
                    onChange={(e) => {
                      const next = [...variants];
                      next[i] = { ...next[i], image: e.target.value };
                      setVariants(next);
                    }}
                    className="h-9 min-w-0 flex-1 rounded-lg border border-border px-2 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMediaPicker({ field: "variant", variantIndex: i })
                    }
                  >
                    Gallery
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="sm:col-span-2"
                  onClick={() =>
                    setVariants((list) => list.filter((_, j) => j !== i))
                  }
                >
                  Remove variant
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
      </Button>

      <MediaPicker
        open={mediaPicker !== null}
        onClose={() => setMediaPicker(null)}
        mode={
          mediaPicker?.field === "images" ? "multiple" : "single"
        }
        accept="image"
        title={
          mediaPicker?.field === "images"
            ? "Add product gallery images"
            : mediaPicker?.field === "hover"
              ? "Choose hover image"
              : mediaPicker?.field === "og"
                ? "Choose OG image"
                : "Choose variant image"
        }
        onSelect={(urls) => {
          if (!mediaPicker) return;
          if (mediaPicker.field === "images") {
            const merged = [...new Set([...parseImageLines(form.images), ...urls])];
            setForm((f) => ({ ...f, images: merged.join("\n") }));
          } else if (mediaPicker.field === "hover") {
            setForm((f) => ({ ...f, hoverImage: urls[0] ?? "" }));
          } else if (mediaPicker.field === "og") {
            setForm((f) => ({ ...f, ogImage: urls[0] ?? "" }));
          } else if (mediaPicker.field === "variant") {
            const next = [...variants];
            const row = next[mediaPicker.variantIndex];
            if (row) {
              next[mediaPicker.variantIndex] = {
                ...row,
                image: urls[0] ?? "",
              };
              setVariants(next);
            }
          }
        }}
      />
    </form>
  );
}
