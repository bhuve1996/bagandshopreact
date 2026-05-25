"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slug";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";
import type { GiftBundleKind } from "@/types/corporate";

type ProductOption = { id: string; slug: string; name: string; price: number };

type BundleItemRow = { productId: string; quantity: number };

type BundleRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  tagline: string | null;
  image: string;
  kind: GiftBundleKind;
  priceOverride: number | null;
  minOrderQty: number;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  items: (BundleItemRow & { product?: { id: string } })[];
  _count?: { inquiries: number };
};

type InquiryRow = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  quantity: number | null;
  message: string | null;
  status: "NEW" | "CONTACTED" | "CLOSED";
  createdAt: string;
  bundle: { id: string; name: string; slug: string } | null;
};

const emptyBundle = (kind: GiftBundleKind) => ({
  name: "",
  slug: "",
  description: "",
  tagline: "",
  image: "",
  kind,
  priceOverride: "",
  minOrderQty: kind === "GIFTING" ? "1" : "10",
  active: true,
  featured: false,
  sortOrder: "0",
  items: [{ productId: "", quantity: 1 }] as BundleItemRow[],
});

export function CorporateAdmin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"bundles" | "inquiries">("bundles");
  const [bundleKind, setBundleKind] = useState<GiftBundleKind>("GIFTING");
  const [editing, setEditing] = useState<BundleRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyBundle("GIFTING"));
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: bundles, isLoading: bundlesLoading } = useQuery({
    queryKey: ["admin-corporate-bundles", bundleKind],
    queryFn: () =>
      fetch(`/api/admin/corporate/bundles?kind=${bundleKind}`).then(
        (r) => r.json() as Promise<BundleRow[]>
      ),
  });

  const { data: inquiries } = useQuery({
    queryKey: ["admin-corporate-inquiries"],
    queryFn: () =>
      fetch("/api/admin/corporate/inquiries").then(
        (r) => r.json() as Promise<InquiryRow[]>
      ),
    enabled: tab === "inquiries",
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products-options"],
    queryFn: () =>
      fetch("/api/admin/products").then((r) => {
        if (!r.ok) return [] as ProductOption[];
        return r.json() as Promise<
          { id: string; slug: string; name: string; price: number }[]
        >;
      }),
    enabled: creating || !!editing,
  });

  function startCreate() {
    setEditing(null);
    setCreating(true);
    setForm(emptyBundle(bundleKind));
    setSlugTouched(false);
  }

  function startEdit(b: BundleRow) {
    setCreating(false);
    setEditing(b);
    setForm({
      name: b.name,
      slug: b.slug,
      description: b.description,
      tagline: b.tagline ?? "",
      image: b.image,
      kind: b.kind,
      priceOverride: b.priceOverride != null ? String(b.priceOverride) : "",
      minOrderQty: String(b.minOrderQty),
      active: b.active,
      featured: b.featured,
      sortOrder: String(b.sortOrder),
      items:
        b.items.length > 0
          ? b.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            }))
          : [{ productId: "", quantity: 1 }],
    });
    setSlugTouched(true);
  }

  function cancelForm() {
    setEditing(null);
    setCreating(false);
    setForm(emptyBundle(bundleKind));
  }

  function addItemRow() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: "", quantity: 1 }],
    }));
  }

  function removeItemRow(index: number) {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));
  }

  async function saveBundle(e: React.FormEvent) {
    e.preventDefault();
    const items = form.items.filter((i) => i.productId);
    if (items.length === 0) {
      toast.error("Add at least one product to the bundle");
      return;
    }
    const payload = {
      id: editing?.id,
      slug: form.slug,
      name: form.name,
      description: form.description,
      tagline: form.tagline || undefined,
      kind: form.kind,
      image: form.image,
      priceOverride: form.priceOverride
        ? Number(form.priceOverride)
        : null,
      minOrderQty: Number(form.minOrderQty) || 10,
      active: form.active,
      featured: form.featured,
      sortOrder: Number(form.sortOrder) || 0,
      items,
    };
    const res = await fetch("/api/admin/corporate/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error("Save failed", json.error ?? "Try again");
      return;
    }
    toast.success(editing ? "Bundle updated" : "Bundle created");
    cancelForm();
    qc.invalidateQueries({ queryKey: ["admin-corporate-bundles"] });
  }

  async function deleteBundle(id: string) {
    if (!confirm("Delete this bundle? Inquiries will keep but lose bundle link."))
      return;
    const res = await fetch(`/api/admin/corporate/bundles/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Bundle deleted");
    qc.invalidateQueries({ queryKey: ["admin-corporate-bundles"] });
  }

  async function updateInquiryStatus(id: string, status: InquiryRow["status"]) {
    const res = await fetch("/api/admin/corporate/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-corporate-inquiries"] });
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-border px-3 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={tab === "bundles" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("bundles")}
        >
          Bundles
        </Button>
        <Button
          variant={tab === "inquiries" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("inquiries")}
        >
          Inquiries
        </Button>
      </div>

      {tab === "bundles" && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={bundleKind === "GIFTING" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setBundleKind("GIFTING");
                cancelForm();
              }}
            >
              Perfect gifting
            </Button>
            <Button
              variant={bundleKind === "CORPORATE" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setBundleKind("CORPORATE");
                cancelForm();
              }}
            >
              Corporate
            </Button>
          </div>
          <div className="flex justify-between gap-4">
            <p className="text-sm text-muted">
              {bundleKind === "GIFTING"
                ? "Gift sets for /gifting — shoppers can add the full bundle to cart."
                : "Corporate sample kits for /corporate — linked to the contact form."}
            </p>
            {!creating && !editing && (
              <Button size="sm" onClick={startCreate}>
                New bundle
              </Button>
            )}
          </div>

          {(creating || editing) && (
            <form
              onSubmit={saveBundle}
              className="card-premium space-y-4 p-6"
            >
              <h3 className="font-semibold">
                {editing ? "Edit bundle" : "New bundle"}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="font-medium">Name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name,
                        slug: slugTouched ? f.slug : slugify(name),
                      }));
                    }}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium">Slug</span>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setForm((f) => ({ ...f, slug: e.target.value }));
                    }}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium">Description</span>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium">Tagline</span>
                  <input
                    value={form.tagline}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tagline: e.target.value }))
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium">Image URL</span>
                  <input
                    required
                    value={form.image}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image: e.target.value }))
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium">Price override (₹, optional)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.priceOverride}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priceOverride: e.target.value }))
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium">Type</span>
                  <select
                    value={form.kind}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        kind: e.target.value as GiftBundleKind,
                        minOrderQty:
                          e.target.value === "GIFTING" ? "1" : f.minOrderQty,
                      }))
                    }
                    className={`mt-1 ${inputClass}`}
                  >
                    <option value="GIFTING">Perfect gifting</option>
                    <option value="CORPORATE">Corporate</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="font-medium">Min order qty</span>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.minOrderQty}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minOrderQty: e.target.value }))
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium">Sort order</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sortOrder: e.target.value }))
                    }
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, active: e.target.checked }))
                    }
                  />
                  Active on storefront
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, featured: e.target.checked }))
                    }
                  />
                  Featured on homepage
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Products in bundle</p>
                {form.items.map((item, index) => (
                  <div key={index} className="flex flex-wrap gap-2">
                    <select
                      required
                      value={item.productId}
                      onChange={(e) => {
                        const productId = e.target.value;
                        setForm((f) => {
                          const items = [...f.items];
                          items[index] = { ...items[index], productId };
                          const prod = products?.find((p) => p.id === productId);
                          return {
                            ...f,
                            items,
                            image:
                              !f.image && prod
                                ? ""
                                : f.image,
                          };
                        });
                      }}
                      className={`min-w-[200px] flex-1 ${inputClass}`}
                    >
                      <option value="">Select product</option>
                      {products?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatPrice(p.price)})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className={`w-24 ${inputClass}`}
                      value={item.quantity}
                      onChange={(e) => {
                        const quantity = Number(e.target.value) || 1;
                        setForm((f) => {
                          const items = [...f.items];
                          items[index] = { ...items[index], quantity };
                          return { ...f, items };
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItemRow(index)}
                      disabled={form.items.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                  Add product
                </Button>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save bundle</Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {bundlesLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-stone-50 dark:bg-stone-900">
                  <tr>
                    <th className="p-4">Bundle</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Min qty</th>
                    <th className="p-4">Status</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {(bundles ?? []).map((b) => (
                    <tr key={b.id} className="border-b border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {b.image ? (
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                              <Image
                                src={b.image}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                          <div>
                            <p className="font-medium">{b.name}</p>
                            <p className="text-xs text-muted">/{b.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{b.items?.length ?? 0}</td>
                      <td className="p-4">{b.minOrderQty}</td>
                      <td className="p-4">
                        {b.active ? "Live" : "Hidden"}
                        {b.featured ? " · Featured" : ""}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(b)}
                        >
                          Edit
                        </Button>{" "}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBundle(b.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "inquiries" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-stone-50 dark:bg-stone-900">
              <tr>
                <th className="p-4">Company</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Bundle</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {(inquiries ?? []).map((row) => (
                <tr key={row.id} className="border-b border-border align-top">
                  <td className="p-4">
                    <p className="font-medium">{row.companyName}</p>
                    {row.message ? (
                      <p className="mt-1 max-w-xs text-xs text-muted">
                        {row.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <p>{row.contactName}</p>
                    <a
                      href={`mailto:${row.email}`}
                      className="text-xs underline"
                    >
                      {row.email}
                    </a>
                    {row.phone ? (
                      <p className="text-xs text-muted">{row.phone}</p>
                    ) : null}
                    {row.quantity ? (
                      <p className="text-xs text-muted">Qty: {row.quantity}</p>
                    ) : null}
                  </td>
                  <td className="p-4">{row.bundle?.name ?? "—"}</td>
                  <td className="p-4">
                    <select
                      value={row.status}
                      onChange={(e) =>
                        updateInquiryStatus(
                          row.id,
                          e.target.value as InquiryRow["status"]
                        )
                      }
                      className={inputClass}
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                  <td className="p-4 text-xs text-muted">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(inquiries ?? []).length === 0 && (
            <p className="p-6 text-sm text-muted">No inquiries yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
