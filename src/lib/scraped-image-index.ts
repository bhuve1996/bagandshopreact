import fs from "fs";
import path from "path";

export type ScrapedImageIndex = {
  urlToLocal: Map<string, string>;
  handleToUrls: Map<string, string[]>;
  scrapedRoot: string;
  publicRoot: string;
};

function normalizeUrl(url: string): string {
  return url.replace(/^\/\//, "https://").split("?")[0].toLowerCase();
}

function fileHashKey(url: string): string | null {
  const base = path.basename(url.split("?")[0]).toLowerCase();
  const match = base.match(/^([a-f0-9]{16,})/);
  return match?.[1] ?? null;
}

function isProductImageUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (!u.includes("/files/") && !u.includes("/products/")) return false;
  if (u.includes("logo") || u.includes("favicon") || u.includes("icon")) return false;
  if (u.includes("_50x") || u.includes("_100x") && !u.includes("_300x") && !u.includes("_600x")) {
    return false;
  }
  return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u);
}

export function loadScrapedImageIndex(
  scrapedDataDir = path.join(process.cwd(), "data", "scraped-data")
): ScrapedImageIndex {
  const jsonPath = path.join(scrapedDataDir, "website-data.json");
  const urlToLocal = new Map<string, string>();
  const handleToUrls = new Map<string, string[]>();

  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
      assets?: { images?: { url: string; localPath: string }[] };
      pages?: { html?: string; renderedHTML?: string; path?: string; url?: string }[];
    };

    for (const img of data.assets?.images ?? []) {
      if (!img.url || !img.localPath) continue;
      urlToLocal.set(normalizeUrl(img.url), img.localPath);
      const hash = fileHashKey(img.url);
      if (hash) urlToLocal.set(hash, img.localPath);
    }

    for (const page of data.pages ?? []) {
      const html = page.renderedHTML ?? page.html ?? "";
      const handles = [
        ...html.matchAll(/\/products\/([a-z0-9-]+)/gi),
      ].map((m) => m[1]);

      for (const handle of new Set(handles)) {
        const blockRegex = new RegExp(
          `[\\s\\S]{0,2500}\\/products\\/${handle}[\\s\\S]{0,2500}`,
          "gi"
        );
        const block = blockRegex.exec(html)?.[0] ?? "";
        const srcs = [
          ...block.matchAll(/src=["']([^"']+)["']/gi),
        ]
          .map((m) => m[1].replace(/^\/\//, "https://"))
          .filter(isProductImageUrl);

        if (srcs.length) {
          const existing = handleToUrls.get(handle) ?? [];
          handleToUrls.set(handle, [...new Set([...existing, ...srcs])]);
        }
      }
    }
  }

  return {
    urlToLocal,
    handleToUrls,
    scrapedRoot: scrapedDataDir,
    publicRoot: path.join(process.cwd(), "public", "products"),
  };
}

export function resolveScrapedLocalPath(
  index: ScrapedImageIndex,
  remoteUrl: string
): string | null {
  const norm = normalizeUrl(remoteUrl);
  if (index.urlToLocal.has(norm)) {
    return path.join(index.scrapedRoot, index.urlToLocal.get(norm)!);
  }
  const hash = fileHashKey(remoteUrl);
  if (hash && index.urlToLocal.has(hash)) {
    return path.join(index.scrapedRoot, index.urlToLocal.get(hash)!);
  }
  for (const [url, local] of index.urlToLocal) {
    if (url.includes(hash ?? "___") && hash) {
      return path.join(index.scrapedRoot, local);
    }
  }
  return null;
}

export function getScrapedImagesForHandle(
  index: ScrapedImageIndex,
  handle: string
): string[] {
  const urls = index.handleToUrls.get(handle) ?? [];
  const locals: string[] = [];
  for (const url of urls) {
    const local = resolveScrapedLocalPath(index, url);
    if (local && fs.existsSync(local)) locals.push(local);
  }
  return [...new Set(locals)];
}

/** Pool of product-like images from scraped assets (excludes logos). */
export function getScrapedImagePool(index: ScrapedImageIndex): string[] {
  const pool: string[] = [];
  const seen = new Set<string>();
  for (const localRel of index.urlToLocal.values()) {
    const full = path.join(index.scrapedRoot, localRel);
    if (seen.has(full) || !fs.existsSync(full)) continue;
    const base = path.basename(localRel).toLowerCase();
    if (base.includes("logo") || base.startsWith("image_0.")) continue;
    seen.add(full);
    pool.push(full);
  }
  return pool;
}

export function copyToPublicProductFolder(
  index: ScrapedImageIndex,
  slug: string,
  sourceFiles: string[]
): string[] {
  const outDir = path.join(index.publicRoot, slug);
  fs.mkdirSync(outDir, { recursive: true });

  const publicPaths: string[] = [];
  sourceFiles.forEach((src, i) => {
    if (!fs.existsSync(src)) return;
    const ext = path.extname(src) || ".jpg";
    const destName =
      i === 0 ? `main${ext}` : `gallery-${String(i).padStart(2, "0")}${ext}`;
    const dest = path.join(outDir, destName);
    fs.copyFileSync(src, dest);
    publicPaths.push(`/products/${slug}/${destName}`);
  });

  return publicPaths;
}

export function assignProductImages(
  index: ScrapedImageIndex,
  slug: string,
  csvImageUrls: string[],
  productIndex: number
): string[] {
  const fromHandle = getScrapedImagesForHandle(index, slug);
  if (fromHandle.length > 0) {
    return copyToPublicProductFolder(index, slug, fromHandle);
  }

  const fromCsv: string[] = [];
  for (const url of csvImageUrls) {
    const local = resolveScrapedLocalPath(index, url);
    if (local && fs.existsSync(local)) fromCsv.push(local);
  }
  if (fromCsv.length > 0) {
    return copyToPublicProductFolder(index, slug, fromCsv);
  }

  const pool = getScrapedImagePool(index);
  if (pool.length === 0) return [];

  const count = Math.min(
    Math.max(csvImageUrls.length, 2),
    6,
    pool.length
  );
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(pool[(productIndex * 3 + i) % pool.length]);
  }
  return copyToPublicProductFolder(index, slug, picked);
}
