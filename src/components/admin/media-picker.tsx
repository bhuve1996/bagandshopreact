"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { MediaAsset, MediaKind } from "@/lib/media-gallery";

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  mode?: "single" | "multiple";
  accept?: MediaKind | "any";
  title?: string;
};

export function MediaPicker({
  open,
  onClose,
  onSelect,
  mode = "multiple",
  accept = "image",
  title = "Choose from gallery",
}: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected(new Set());
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data: MediaAsset[]) => setAssets(data))
      .catch(() => toast.error("Could not load gallery"))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = assets.filter((a) => {
    if (accept === "any") return true;
    return a.kind === accept;
  });

  function toggle(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (mode === "single") {
        return next.has(url) ? new Set() : new Set([url]);
      }
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
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
    const listRes = await fetch("/api/admin/media");
    if (listRes.ok) setAssets(await listRes.json());
    setSelected((prev) => {
      const next = new Set(prev);
      urls.forEach((u) => next.add(u));
      return next;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function confirm() {
    if (selected.size === 0) {
      toast.error("Select at least one file");
      return;
    }
    onSelect([...selected]);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close gallery"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="media-picker-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {accept !== "video" ? (
          <div className="border-b border-border px-4 py-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
              multiple
              className="text-sm"
              onChange={(e) => uploadFiles(e.target.files)}
            />
            {uploading ? (
              <p className="mt-1 text-xs text-muted">Uploading…</p>
            ) : (
              <p className="mt-1 text-xs text-muted">
                Upload JPEG, PNG, WebP, GIF, SVG, or AVIF (max 10 MB each)
              </p>
            )}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-muted">Loading gallery…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted">
              No files yet. Upload images or add files under{" "}
              <code className="text-xs">/public/products</code>.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((a) => {
                const isSelected = selected.has(a.url);
                return (
                  <li key={a.url}>
                    <button
                      type="button"
                      onClick={() => toggle(a.url)}
                      className={`group relative w-full overflow-hidden rounded-xl border text-left transition-colors ${
                        isSelected
                          ? "border-stone-900 ring-2 ring-stone-900 dark:border-stone-100 dark:ring-stone-100"
                          : "border-border hover:border-stone-400"
                      }`}
                    >
                      <div className="aspect-square bg-stone-100 dark:bg-stone-800">
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
                      </div>
                      <p className="truncate px-2 py-1.5 font-mono text-[10px] text-muted">
                        {a.filename}
                      </p>
                      {isSelected ? (
                        <span className="absolute right-2 top-2 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] text-white dark:bg-stone-100 dark:text-stone-900">
                          Selected
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={confirm}>
            {mode === "single"
              ? "Use selected"
              : selected.size > 0
                ? `Add ${selected.size} selected`
                : "Add selected"}
          </Button>
        </div>
      </div>
    </div>
  );
}
