"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slug";
import { toast } from "@/lib/toast";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string;
  _count: { products: number };
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
};

export function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () =>
      fetch("/api/admin/categories").then((r) => r.json() as Promise<CategoryRow[]>),
  });
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  function startCreate() {
    setEditing(null);
    setCreating(true);
    setForm(emptyForm);
    setSlugTouched(false);
  }

  function startEdit(c: CategoryRow) {
    setCreating(false);
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      image: c.image,
    });
    setSlugTouched(true);
  }

  function cancelForm() {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
  }

  function onNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugTouched ? f.slug : slugify(name),
    }));
  }

  async function saveCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error((json as { error?: string }).error ?? "Could not create category");
      return;
    }
    toast.success("Category created");
    cancelForm();
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch(`/api/admin/categories/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error((json as { error?: string }).error ?? "Could not update category");
      return;
    }
    toast.success("Category updated");
    cancelForm();
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }

  async function remove(c: CategoryRow) {
    if (
      !confirm(
        `Delete “${c.name}”? This only works when no products are assigned.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error((json as { error?: string }).error ?? "Could not delete category");
      return;
    }
    toast.success("Category deleted");
    if (editing?.id === c.id) cancelForm();
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }

  const showForm = creating || editing;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="mt-1 text-sm text-muted">
            Shop navigation and filters — create, edit name/slug/image, or remove empty
            categories.
          </p>
        </div>
        {!creating && (
          <Button type="button" onClick={startCreate}>
            Add category
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={creating ? saveCreate : saveEdit}
          className="card-premium grid max-w-xl gap-4 p-6 sm:grid-cols-2"
        >
          <h2 className="text-sm font-semibold sm:col-span-2">
            {creating ? "New category" : `Edit ${editing?.name}`}
          </h2>
          <label className="block">
            <span className="text-xs text-muted">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Slug</span>
            <input
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted">Description</span>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted">Image URL</span>
            <input
              required
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm font-mono"
              placeholder="https://…"
            />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit">{creating ? "Create" : "Save"}</Button>
            <Button type="button" variant="outline" onClick={cancelForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (data ?? []).length === 0 ? (
        <p className="text-sm text-muted">
          No categories yet. Add one above or run <code className="text-xs">db:seed</code> /
          import.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((c) => (
            <div key={c.id} className="card-premium overflow-hidden">
              <div className="relative aspect-video bg-stone-100 dark:bg-stone-800">
                <Image src={c.image} alt={c.name} fill className="object-cover" sizes="300px" />
              </div>
              <div className="p-4">
                <h3 className="font-medium">{c.name}</h3>
                <p className="text-xs text-muted">{c.slug}</p>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-xs">{c.description}</p>
                )}
                <p className="mt-2 text-xs">{c._count.products} products</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(c)}
                  >
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={`/collections/${c.slug}`} target="_blank">
                      View
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => remove(c)}
                    disabled={c._count.products > 0}
                    title={
                      c._count.products > 0
                        ? "Reassign products before deleting"
                        : undefined
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
