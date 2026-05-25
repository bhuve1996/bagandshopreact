"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DEFAULT_HERO_IMAGE = "/banners/smart-shopping-banner.png";

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  href: string;
  active: boolean;
  showContent: boolean;
  sortOrder: number;
};

const emptyForm = {
  title: "",
  subtitle: "",
  image: DEFAULT_HERO_IMAGE,
  href: "/collections",
  showContent: false,
  active: true,
};

export function BannersAdmin() {
  const qc = useQueryClient();
  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["admin-banners"],
    queryFn: () =>
      fetch("/api/admin/banners").then((r) => r.json() as Promise<Banner[]>),
  });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  function startEdit(b: Banner) {
    setEditingId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      image: b.image,
      href: b.href,
      showContent: b.showContent,
      active: b.active,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editingId ?? undefined }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Could not save banner");
      return;
    }
    toast.success(editingId ? "Banner updated" : "Banner created");
    cancelEdit();
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  async function toggleShowContent(b: Banner) {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showContent: !b.showContent }),
    });
    if (!res.ok) {
      toast.error("Could not update banner");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  async function toggleActive(b: Banner) {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    if (!res.ok) {
      toast.error("Could not update banner");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete “${title}”?`)) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete banner");
      return;
    }
    if (editingId === id) cancelEdit();
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Banners (CMS)</h1>
      <p className="text-sm text-muted">
        Homepage hero slides. Turn off <strong>Show overlay content</strong> when
        the image already includes text (e.g. Smart Shopping banner). Pick images
        from the{" "}
        <Link href="/admin/media" className="underline">
          media gallery
        </Link>
        .
      </p>
      <form
        onSubmit={handleSubmit}
        className="card-premium grid gap-3 p-4 sm:grid-cols-2"
      >
        <input
          placeholder="Title (for admin & accessibility)"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm"
        />
        <input
          placeholder="Subtitle (only if overlay is on)"
          value={form.subtitle}
          onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm"
          disabled={!form.showContent}
        />
        <div className="flex gap-2 sm:col-span-2">
          <input
            placeholder="Image URL"
            required
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            className="h-10 min-w-0 flex-1 rounded-lg border border-border px-3 font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setImagePickerOpen(true)}
          >
            Gallery
          </Button>
        </div>
        {form.image ? (
          <div className="relative aspect-21/9 overflow-hidden rounded-lg border border-border sm:col-span-2">
            <Image
              src={form.image}
              alt="Banner preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : null}
        <input
          placeholder="Link href"
          required
          value={form.href}
          onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm"
        />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.showContent}
            onChange={(e) =>
              setForm((f) => ({ ...f, showContent: e.target.checked }))
            }
            className="size-4 rounded border-border"
          />
          Show overlay content (title, subtitle, and Shop now button)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm((f) => ({ ...f, active: e.target.checked }))
            }
            className="size-4 rounded border-border"
          />
          Active on homepage
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit">
            {editingId ? "Update banner" : "Save banner"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
      <ul className="space-y-3">
        {banners.map((b: Banner) => (
          <li
            key={b.id}
            className="card-premium flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="relative h-14 w-28 shrink-0 overflow-hidden rounded-md bg-stone-100">
                <Image
                  src={b.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{b.title}</p>
                <p className="truncate text-xs text-muted">{b.href}</p>
                <p className="mt-1 text-xs text-muted">
                  {b.showContent
                    ? "Overlay content visible"
                    : "Image only (no overlay)"}
                  {" · "}
                  {b.active ? "Live" : "Hidden"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleShowContent(b)}
                className="text-xs text-foreground underline"
              >
                {b.showContent ? "Hide content" : "Show content"}
              </button>
              <button
                type="button"
                onClick={() => toggleActive(b)}
                className={`text-xs ${b.active ? "text-green-700" : "text-muted"}`}
              >
                {b.active ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                onClick={() => startEdit(b)}
                className="text-xs text-foreground underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(b.id, b.title)}
                className="text-xs text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <MediaPicker
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        mode="single"
        accept="image"
        title="Choose banner image"
        onSelect={(urls) => {
          if (urls[0]) setForm((f) => ({ ...f, image: urls[0] }));
        }}
      />
    </div>
  );
}
