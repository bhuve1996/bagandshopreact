import { cn } from "@/lib/utils";
import { getVariantSwatches } from "@/lib/product-variant-display";
import type { Product } from "@/types";

type Props = {
  product: Product;
  className?: string;
};

export function ProductCardVariantSwatches({ product, className }: Props) {
  const swatches = getVariantSwatches(product);
  if (swatches.length === 0) return null;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      aria-label={`${swatches.length} options available`}
    >
      {swatches.map((s) => (
        <span
          key={s.key}
          title={s.label}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border shadow-sm"
          style={
            s.hex
              ? { backgroundColor: s.hex }
              : undefined
          }
        >
          {!s.hex && (
            <span className="max-w-[18px] truncate px-0.5 text-[8px] font-medium uppercase leading-none">
              {s.label.slice(0, 2)}
            </span>
          )}
        </span>
      ))}
      {product.variants && product.variants.length > swatches.length && (
        <span className="text-[10px] text-muted">
          +{product.variants.length - swatches.length}
        </span>
      )}
    </div>
  );
}
