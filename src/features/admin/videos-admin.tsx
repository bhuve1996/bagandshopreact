"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SiteVideoRow = {
  id: string;
  title: string;
  src: string;
  poster: string | null;
  href: string | null;
  active: boolean;
  sortOrder: number;
};

export function VideosAdmin() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    poster: "",
    href: "",
  });

  const { data } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: () =>
      fetch("/api/admin/videos").then(
        (r) => r.json() as Promise<SiteVideoRow[]>
      ),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a video file to upload");
      return;
    }
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("title", form.title);
    if (form.poster) body.append("poster", form.poster);
    if (form.href) body.append("href", form.href);

    const res = await fetch("/api/admin/videos", { method: "POST", body });
    setUploading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Upload failed");
      return;
    }
    toast.success("Video uploaded");
    setForm({ title: "", poster: "", href: "" });
    if (fileRef.current) fileRef.current.value = "";
    qc.invalidateQueries({ queryKey: ["admin-videos"] });
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/videos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (!res.ok) {
      toast.error("Could not update video");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-videos"] });
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete “${title}”?`)) return;
    const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete video");
      return;
    }
    toast.success("Video deleted");
    qc.invalidateQueries({ queryKey: ["admin-videos"] });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Homepage videos</h1>
        <p className="mt-1 text-sm text-muted">
          Upload MP4, WebM, MOV, or OGG (max 80 MB). Active videos play in the
          homepage carousel.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-premium grid gap-3 p-4 sm:grid-cols-2"
      >
        <input
          placeholder="Accessible title (required)"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm sm:col-span-2"
        />
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/ogg"
          required
          className="text-sm sm:col-span-2"
          aria-label="Video file"
        />
        <input
          placeholder="Poster image URL (optional)"
          value={form.poster}
          onChange={(e) => setForm((f) => ({ ...f, poster: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm sm:col-span-2"
        />
        <input
          placeholder="Link href (optional)"
          value={form.href}
          onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
          className="h-10 rounded-lg border border-border px-3 text-sm"
        />
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload video"}
        </Button>
      </form>

      <ul className="space-y-3">
        {(data ?? []).map((v) => (
          <li
            key={v.id}
            className="card-premium flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg bg-stone-100">
                <video
                  src={v.src}
                  poster={v.poster ?? undefined}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{v.title}</p>
                <p className="truncate text-xs text-muted">{v.src}</p>
                {v.href ? (
                  <p className="text-xs text-muted">Link: {v.href}</p>
                ) : null}
                <p className="text-xs text-muted">
                  Order: {v.sortOrder} ·{" "}
                  {v.active ? "Visible on storefront" : "Hidden"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => toggleActive(v.id, v.active)}
                className="text-xs text-stone-600 underline dark:text-stone-300"
              >
                {v.active ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => remove(v.id, v.title)}
                className="text-xs text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {(data ?? []).length === 0 ? (
          <p className="text-sm text-muted">No videos yet.</p>
        ) : null}
      </ul>
    </div>
  );
}
