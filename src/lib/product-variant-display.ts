import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

const COLOR_HEX: Record<string, string> = {
  black: "#1c1917",
  white: "#fafaf9",
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  pink: "#ec4899",
  gold: "#c4a77d",
  silver: "#a8a29e",
  brown: "#78350f",
  grey: "#78716c",
  gray: "#78716c",
  beige: "#d6d3d1",
  navy: "#1e3a5f",
  yellow: "#eab308",
  orange: "#ea580c",
  purple: "#9333ea",
};

export function colorToSwatch(color?: string): string | null {
  if (!color) return null;
  const key = color.toLowerCase().trim();
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  if (/^#[0-9a-f]{3,8}$/i.test(key)) return key;
  return null;
}

export function getInStockVariants(variants?: ProductVariant[]) {
  return (variants ?? []).filter((v) => v.inStock);
}

export function getDefaultVariant(product: Product): ProductVariant | null {
  const list = product.variants ?? [];
  if (list.length === 0) return null;
  return list.find((v) => v.inStock) ?? list[0];
}

export type ProductPriceDisplay = {
  hasMultipleVariants: boolean;
  fromPrice: number;
  compareAtPrice?: number;
  showFromLabel: boolean;
};

export function getProductPriceDisplay(product: Product): ProductPriceDisplay {
  const variants = product.variants ?? [];
  const inStock = getInStockVariants(variants);
  const pool = inStock.length > 0 ? inStock : variants;

  if (pool.length === 0) {
    return {
      hasMultipleVariants: false,
      fromPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      showFromLabel: false,
    };
  }

  const prices = pool.map((v) => v.price);
  const fromPrice = Math.min(...prices);
  const maxCompare = pool
    .map((v) => v.compareAtPrice)
    .filter((p): p is number => p != null && p > fromPrice);
  const compareAtPrice =
    maxCompare.length > 0 ? Math.max(...maxCompare) : product.compareAtPrice;

  const hasMultipleVariants =
    variants.length > 1 ||
    (variants.length === 1 && variants[0].name !== "Standard");
  const showFromLabel =
    hasMultipleVariants &&
    (prices.length > 1 || new Set(prices).size > 1 || variants.length > 1);

  return {
    hasMultipleVariants,
    fromPrice,
    compareAtPrice:
      compareAtPrice && compareAtPrice > fromPrice ? compareAtPrice : undefined,
    showFromLabel,
  };
}

export function formatProductPrice(product: Product): string {
  const { fromPrice, showFromLabel } = getProductPriceDisplay(product);
  return showFromLabel ? `From ${formatPrice(fromPrice)}` : formatPrice(fromPrice);
}

/** Unique swatches for PLP (color label + optional hex). Max 6. */
export function getVariantSwatches(product: Product, max = 6) {
  const variants = product.variants ?? [];
  if (variants.length <= 1 && variants[0]?.name === "Standard") return [];

  const seen = new Set<string>();
  const swatches: { key: string; label: string; hex: string | null }[] = [];

  for (const v of variants) {
    const label = v.color?.trim() || v.name;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    swatches.push({ key, label, hex: colorToSwatch(v.color ?? label) });
    if (swatches.length >= max) break;
  }

  return swatches;
}
