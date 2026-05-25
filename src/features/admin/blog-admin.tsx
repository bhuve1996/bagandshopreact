"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { resolveBlogCoverImage } from "@/lib/blog-image";
import { slugify } from "@/lib/slug";
import { toast } from "@/lib/toast";

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  author: string | null;
  published: boolean;
  publishedAt: string | null;
};

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  published: false,
};

export function BlogAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () =>
      fetch("/api/admin/blog").then((r) => r.json() as Promise<BlogPostRow[]>),
  });
  const [editing, setEditing] = useState<BlogPostRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [ogPickerOpen, setOgPickerOpen] = useState(false);

  function startCreate() {
    setEditing(null);
    setCreating(true);
    setForm(emptyForm);
    setSlugTouched(false);
  }

  function startEdit(post: BlogPostRow) {
    setCreating(false);
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage ?? "",
      author: post.author ?? "",
      metaTitle: post.metaTitle ?? "",
      metaDescription: post.metaDescription ?? "",
      ogImage: post.ogImage ?? "",
      published: post.published,
    });
    setSlugTouched(true);
  }

  function cancelForm() {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
  }

  function onTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched ? f.slug : slugify(title),
    }));
  }

  async function saveCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        coverImage: form.coverImage || null,
        author: form.author || null,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        ogImage: form.ogImage || null,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error((json as { error?: string }).error ?? "Could not create post");
      return;
    }
    toast.success("Post created");
    cancelForm();
    qc.invalidateQueries({ queryKey: ["admin-blog"] });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch(`/api/admin/blog/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        coverImage: form.coverImage || null,
        author: form.author || null,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        ogImage: form.ogImage || null,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error((json as { error?: string }).error ?? "Could not update post");
      return;
    }
    toast.success("Post updated");
    cancelForm();
    qc.invalidateQueries({ queryKey: ["admin-blog"] });
  }

  async function togglePublished(post: BlogPostRow) {
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    if (!res.ok) {
      toast.error("Could not update status");
      return;
    }
    toast.success(post.published ? "Post unpublished" : "Post published");
    qc.invalidateQueries({ queryKey: ["admin-blog"] });
  }

  async function remove(post: BlogPostRow) {
    if (!confirm(`Delete “${post.title}”?`)) return;
    const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error((json as { error?: string }).error ?? "Could not delete post");
      return;
    }
    toast.success("Post deleted");
    if (editing?.id === post.id) cancelForm();
    qc.invalidateQueries({ queryKey: ["admin-blog"] });
  }

  const showForm = creating || editing;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="mt-1 text-sm text-muted">
            Write and publish articles for the storefront blog at{" "}
            <Link href="/blog" className="underline" target="_blank">
              /blog
            </Link>
            .
          </p>
        </div>
        {!creating && (
          <Button type="button" onClick={startCreate}>
            New post
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={creating ? saveCreate : saveEdit}
          className="card-premium grid max-w-2xl gap-4 p-6 sm:grid-cols-2"
        >
          <h2 className="text-sm font-semibold sm:col-span-2">
            {creating ? "New post" : `Edit ${editing?.title}`}
          </h2>
          <label className="block">
            <span className="text-xs text-muted">Title</span>
            <input
              required
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
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
            <span className="text-xs text-muted">Excerpt (listing & SEO)</span>
            <textarea
              required
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted">
              Body (blank line = new paragraph)
            </span>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={10}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-mono"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-muted">Cover image URL</span>
            <div className="mt-1 flex gap-2">
              <input
                value={form.coverImage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, coverImage: e.target.value }))
                }
                className="h-10 min-w-0 flex-1 rounded-lg border border-border px-3 text-sm font-mono"
                placeholder="Optional"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setCoverPickerOpen(true)}
              >
                Gallery
              </Button>
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted">Author (optional)</span>
            <input
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </label>
          <label className="flex items-end gap-2 pb-1 sm:col-span-1">
            <input
              id="blog-published"
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.checked }))
              }
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm">Published on storefront</span>
          </label>
          <details className="sm:col-span-2">
            <summary className="cursor-pointer text-xs font-medium text-muted">
              SEO overrides (optional)
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted">Meta title</span>
                <input
                  value={form.metaTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, metaTitle: e.target.value }))
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted">Meta description</span>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, metaDescription: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted">OG image URL</span>
                <div className="mt-1 flex gap-2">
                  <input
                    value={form.ogImage}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ogImage: e.target.value }))
                    }
                    className="h-10 min-w-0 flex-1 rounded-lg border border-border px-3 text-sm font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOgPickerOpen(true)}
                  >
                    Gallery
                  </Button>
                </div>
              </label>
            </div>
          </details>
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
        <p className="text-sm text-muted">No posts yet. Create one above.</p>
      ) : (
        <ul className="space-y-3">
          {(data ?? []).map((post) => (
            <li
              key={post.id}
              className="card-premium flex flex-col gap-4 p-4 sm:flex-row sm:items-start"
            >
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                <Image
                  src={resolveBlogCoverImage(post.coverImage)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{post.title}</h3>
                  <span
                    className={
                      post.published
                        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                        : "rounded-full bg-stone-100 px-2 py-0.5 text-xs text-muted dark:bg-stone-800"
                    }
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-muted">/blog/{post.slug}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(post)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublished(post)}
                  >
                    {post.published ? "Unpublish" : "Publish"}
                  </Button>
                  {post.published ? (
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        View
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => remove(post)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <MediaPicker
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        mode="single"
        accept="image"
        title="Choose cover image"
        onSelect={(urls) => {
          if (urls[0]) setForm((f) => ({ ...f, coverImage: urls[0] }));
        }}
      />
      <MediaPicker
        open={ogPickerOpen}
        onClose={() => setOgPickerOpen(false)}
        mode="single"
        accept="image"
        title="Choose OG image"
        onSelect={(urls) => {
          if (urls[0]) setForm((f) => ({ ...f, ogImage: urls[0] }));
        }}
      />
    </div>
  );
}
