import { readdir, stat } from "fs/promises";
import path from "path";
import { isBlobMediaUrl, isBlobStorageEnabled, listUploadBlobs } from "@/lib/blob-storage";

export type MediaKind = "image" | "video";
export type MediaSource = "uploads" | "products" | "brand" | "site";

export type MediaAsset = {
  url: string;
  kind: MediaKind;
  source: MediaSource;
  filename: string;
  sizeBytes: number;
  deletable: boolean;
};

const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".ogv"]);

const SCAN_ROOTS: {
  disk: string;
  urlPrefix: string;
  source: MediaSource;
  deletable: boolean;
}[] = [
  {
    disk: path.join(process.cwd(), "public", "uploads", "images"),
    urlPrefix: "/uploads/images",
    source: "uploads",
    deletable: true,
  },
  {
    disk: path.join(process.cwd(), "public", "uploads", "videos"),
    urlPrefix: "/uploads/videos",
    source: "uploads",
    deletable: true,
  },
  {
    disk: path.join(process.cwd(), "public", "products"),
    urlPrefix: "/products",
    source: "products",
    deletable: false,
  },
  {
    disk: path.join(process.cwd(), "public", "bagnshop_brand_assets"),
    urlPrefix: "/bagnshop_brand_assets",
    source: "brand",
    deletable: false,
  },
];

function kindFromExt(ext: string): MediaKind | null {
  const lower = ext.toLowerCase();
  if (IMAGE_EXT.has(lower)) return "image";
  if (VIDEO_EXT.has(lower)) return "video";
  return null;
}

async function walkDir(
  dir: string,
  urlPrefix: string,
  source: MediaSource,
  deletable: boolean,
  out: MediaAsset[]
): Promise<void> {
  let entries: { name: string; isDirectory: () => boolean }[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(full, `${urlPrefix}/${entry.name}`, source, deletable, out);
      continue;
    }
    const ext = path.extname(entry.name);
    const kind = kindFromExt(ext);
    if (!kind) continue;
    const st = await stat(full);
    out.push({
      url: `${urlPrefix}/${entry.name}`,
      kind,
      source,
      filename: entry.name,
      sizeBytes: st.size,
      deletable,
    });
  }
}

async function listBlobUploadAssets(): Promise<MediaAsset[]> {
  if (!isBlobStorageEnabled()) return [];

  const blobs = await listUploadBlobs();
  return blobs.map((blob) => {
    const kind: MediaKind = blob.pathname.includes("/videos/")
      ? "video"
      : "image";
    return {
      url: blob.url,
      kind,
      source: "uploads" as const,
      filename: path.basename(blob.pathname),
      sizeBytes: blob.size,
      deletable: true,
    };
  });
}

export async function listMediaAssets(): Promise<MediaAsset[]> {
  const assets: MediaAsset[] = [];
  assets.push(...(await listBlobUploadAssets()));
  for (const root of SCAN_ROOTS) {
    await walkDir(root.disk, root.urlPrefix, root.source, root.deletable, assets);
  }
  const seen = new Set<string>();
  const deduped = assets.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
  return deduped.sort((a, b) => {
    if (a.source !== b.source) {
      const order: MediaSource[] = ["uploads", "products", "brand", "site"];
      return order.indexOf(a.source) - order.indexOf(b.source);
    }
    return b.url.localeCompare(a.url);
  });
}

/** Admin uploads: local /uploads/* or Vercel Blob URLs. */
export function isDeletableMediaUrl(url: string): boolean {
  return (
    url.startsWith("/uploads/images/") ||
    url.startsWith("/uploads/videos/") ||
    isBlobMediaUrl(url)
  );
}

export function normalizePublicMediaPath(url: string): string | null {
  const trimmed = url.trim();
  if (trimmed.includes("..")) return null;
  if (isBlobMediaUrl(trimmed)) return trimmed;
  if (!trimmed.startsWith("/")) return null;
  if (!trimmed.startsWith("/uploads/")) return null;
  return trimmed;
}
