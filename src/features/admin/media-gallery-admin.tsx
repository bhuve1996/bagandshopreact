"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { formatBytes } from "@/lib/format-bytes";
import type { MediaAsset, MediaKind, MediaSource } from "@/lib/media-gallery";

type Filter = "all" | MediaKind | MediaSource;

const SOURCE_LABEL: Record<MediaSource, string> = {
  uploads: "Uploads",
  products: "Products",
  brand: "Brand",
  site: "Site",
};

export function MediaGalleryAdmin() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: () =>
      fetch("/api/admin/media").then((r) => r.json() as Promise<MediaAsset[]>),
  });

  const filtered = (data ?? []).filter((a) => {
    if (filter === "all") return true;
    if (filter === "image" || filter === "video") return a.kind === filter;
    return a.source === filter;
  });

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }, [qc]);

  async function upload(files: FileList | null) {
    if (!files?.length) {
      toast.error("Choose at least one image");
      return;
    }
    setUploading(true);
    const body = new FormData();
    Array.from(files).forEach((f) => body.append("file", f));
    const res = await fetch("/api/admin/media", { method: "POST", body });
    setUploading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error((j as { error?: string }).error ?? "Upload failed");
      return;
    }
    const { urls } = (await res.json()) as { urls: string[] };
    toast.success(
      urls.length === 1 ? "Image uploaded" : `${urls.length} images uploaded`
    );
    if (fileRef.current) fileRef.current.value = "";
    refresh();
  }

  async function remove(asset: MediaAsset) {
    if (!asset.deletable) {
      toast.error("Imported product images cannot be deleted here");
      return;
    }
    if (!confirm(`Delete ${asset.filename}?`)) return;
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: asset.url }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error((j as { error?: string }).error ?? "Delete failed");
      return;
    }
    toast.success("File deleted");
    refresh();
  }

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url);
    toast.success("URL copied", url);
  }

  const counts = {
    all: data?.length ?? 0,
    image: data?.filter((a) => a.kind === "image").length ?? 0,
    video: data?.filter((a) => a.kind === "video").length ?? 0,
    uploads: data?.filter((a) => a.source === "uploads").length ?? 0,
    products: data?.filter((a) => a.source === "products").length ?? 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Media gallery</h1>
        <p className="mt-1 text-sm text-muted">
          Upload images, browse everything in{" "}
          <code className="text-xs">public/uploads</code> and{" "}
          <code className="text-xs">public/products</code>, then pick URLs in{" "}
          <Link href="/admin/products" className="underline">
            Products
          </Link>
          ,{" "}
          <Link href="/admin/banners" className="underline">
            Banners
          </Link>
          , or{" "}
          <Link href="/admin/videos" className="underline">
            Videos
          </Link>
          .
        </p>
      </div>

      <section className="card-premium space-y-3 p-4">
        <h2 className="text-sm font-semibold">Upload images</h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
          multiple
          className="sr-only"
          onChange={(e) => upload(e.target.files)}
        />
        <p className="text-xs text-muted">
          JPEG, PNG, WebP, GIF, SVG, or AVIF · max 10 MB each · saved to{" "}
          <code className="text-xs">/uploads/images/</code>
        </p>
        <Button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "Uploading…" : "Choose files to upload"}
        </Button>
      </section>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", `All (${counts.all})`],
            ["image", `Images (${counts.image})`],
            ["video", `Videos (${counts.video})`],
            ["uploads", `Uploads (${counts.uploads})`],
            ["products", `Products (${counts.products})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === key
                ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                : "border-border text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading gallery…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">No media in this view.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((a) => (
            <li
              key={a.url}
              className="card-premium flex flex-col overflow-hidden p-0"
            >
              <div className="relative aspect-square bg-stone-100 dark:bg-stone-800">
                {a.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={a.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}
                <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  {SOURCE_LABEL[a.source]}
                </span>
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate font-mono text-[10px]" title={a.url}>
                  {a.url}
                </p>
                <p className="text-[10px] text-muted">
                  {formatBytes(a.sizeBytes)} · {a.kind}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(a.url)}
                    className="text-xs underline"
                  >
                    Copy URL
                  </button>
                  {a.deletable ? (
                    <button
                      type="button"
                      onClick={() => remove(a)}
                      className="text-xs text-red-600"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
