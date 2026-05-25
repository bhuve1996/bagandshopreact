export type ParsedVariant = {
  name: string;
  color?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  image?: string;
  stock: number;
};

export type ParsedProduct = {
  handle: string;
  slug: string;
  name: string;
  description: string;
  vendor: string;
  categoryLabel: string;
  categorySlug: string;
  tags: string[];
  images: string[];
  hoverImage?: string;
  variants: ParsedVariant[];
  price: number;
  compareAtPrice?: number;
};

const PLACEHOLDER_FRAGMENTS = ["no-image-found-placeholder", "placeholder"];

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || (c === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      if (c === "\r") i++;
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugifyCategory(label: string): string {
  const base = label
    .split(">")[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "general";
}

function mapCategorySlug(label: string): string {
  const lower = label.toLowerCase();
  if (
    lower.includes("beauty") ||
    lower.includes("cosmetic") ||
    lower.includes("personal care")
  ) {
    return "beauty";
  }
  if (
    lower.includes("camping") ||
    lower.includes("outdoor") ||
    lower.includes("travel")
  ) {
    return "travel";
  }
  if (lower.includes("electronic") || lower.includes("gadget")) {
    return "tech";
  }
  if (lower.includes("bag") || lower.includes("carry")) {
    return "bags";
  }
  if (
    lower.includes("home") ||
    lower.includes("kitchen") ||
    lower.includes("organization") ||
    lower.includes("furniture")
  ) {
    return "desk";
  }
  if (lower.includes("toy") || lower.includes("game")) {
    return "desk";
  }
  return slugifyCategory(label);
}

function cleanTitle(title: string): string {
  return title
    .replace(/^BagnShop\s*[–-]\s*/i, "")
    .replace(/^Bag\s*&\s*Shop\s*[–-]\s*/i, "")
    .trim();
}

function isPlaceholderImage(url: string): boolean {
  return PLACEHOLDER_FRAGMENTS.some((f) => url.includes(f));
}

function variantLabel(o1: string, o2: string, o3: string): string {
  const parts = [o1, o2, o3].filter(
    (v) => v && v.toLowerCase() !== "default"
  );
  if (parts.length > 0) return parts.join(" / ");
  return "Standard";
}

function parsePrice(value: string): number {
  const n = Math.round(parseFloat(value.replace(/,/g, "")));
  return Number.isFinite(n) ? n : 0;
}

export function parseShopifyProductsCsv(csvText: string): {
  products: ParsedProduct[];
  categories: { slug: string; name: string; description: string }[];
} {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return { products: [], categories: [] };

  const header = rows[0];
  const col = (name: string) => header.indexOf(name);

  const byHandle = new Map<
    string,
    {
      title?: string;
      body?: string;
      vendor?: string;
      categoryLabel?: string;
      tags?: string;
      images: string[];
      variants: ParsedVariant[];
    }
  >();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const handle = row[col("Handle")]?.trim();
    if (!handle) continue;

    let entry = byHandle.get(handle);
    if (!entry) {
      entry = { images: [], variants: [] };
      byHandle.set(handle, entry);
    }

    const title = row[col("Title")]?.trim();
    if (title) entry.title = title;

    const body = row[col("Body (HTML)")]?.trim();
    if (body) entry.body = body;

    const vendor = row[col("Vendor")]?.trim();
    if (vendor) entry.vendor = vendor;

    const cat = row[col("Product Category")]?.trim();
    if (cat) entry.categoryLabel = cat;

    const tags = row[col("Tags")]?.trim();
    if (tags) entry.tags = tags;

    const priceRaw = row[col("Variant Price")]?.trim();
    if (priceRaw && parsePrice(priceRaw) > 0) {
      const o1 = row[col("Option1 Value")]?.trim() ?? "";
      const o2 = row[col("Option2 Value")]?.trim() ?? "";
      const o3 = row[col("Option3 Value")]?.trim() ?? "";
      const variantImage =
        row[col("Variant Image")]?.trim() ||
        row[col("Image Src")]?.trim() ||
        "";
      entry.variants.push({
        name: variantLabel(o1, o2, o3),
        color: o1 && o1.toLowerCase() !== "default" ? o1 : undefined,
        price: parsePrice(priceRaw),
        compareAtPrice: row[col("Variant Compare At Price")]?.trim()
          ? parsePrice(row[col("Variant Compare At Price")])
          : undefined,
        sku: row[col("Variant SKU")]?.trim() || undefined,
        image:
          variantImage && !isPlaceholderImage(variantImage)
            ? variantImage
            : undefined,
        stock: 100,
      });
    }

    const imageSrc = row[col("Image Src")]?.trim();
    if (imageSrc && !isPlaceholderImage(imageSrc)) {
      if (!entry.images.includes(imageSrc)) {
        entry.images.push(imageSrc);
      }
    }
  }

  const categorySet = new Map<string, string>();
  const products: ParsedProduct[] = [];

  for (const [handle, entry] of byHandle) {
    if (!entry.title || entry.variants.length === 0) continue;

    const categoryLabel = entry.categoryLabel || "General";
    const categorySlug = mapCategorySlug(categoryLabel);
    categorySet.set(categorySlug, categoryLabel.split(">")[0].trim());

    const images =
      entry.images.length > 0
        ? entry.images
        : entry.variants
            .map((v) => v.image)
            .filter((u): u is string => Boolean(u));

    if (images.length === 0) continue;

    const prices = entry.variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const firstCompare = entry.variants.find((v) => v.compareAtPrice)?.compareAtPrice;

    const uniqueVariants = new Map<string, ParsedVariant>();
    for (const v of entry.variants) {
      const key = `${v.name}|${v.price}|${v.sku ?? ""}`;
      if (!uniqueVariants.has(key)) uniqueVariants.set(key, v);
    }
    const variants = [...uniqueVariants.values()];

    products.push({
      handle,
      slug: handle,
      name: cleanTitle(entry.title),
      description: stripHtml(entry.body ?? ""),
      vendor: entry.vendor ?? "Bag & Shop",
      categoryLabel,
      categorySlug,
      tags: (entry.tags ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      images,
      hoverImage: images[1],
      variants,
      price: minPrice,
      compareAtPrice: firstCompare,
    });
  }

  const categories = [...categorySet.entries()].map(([slug, name]) => ({
    slug,
    name: name || slug.replace(/-/g, " "),
    description: `Shop ${name || slug}`,
  }));

  return { products, categories };
}
