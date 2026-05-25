"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types";

type VariantSelectorProps = {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (variant: ProductVariant) => void;
};

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: VariantSelectorProps) {
  const labelId = useId();
  const showSelector =
    variants.length > 1 ||
    (variants.length === 1 && variants[0].name !== "Standard");

  if (!showSelector) return null;

  return (
    <div className="mt-6" role="group" aria-labelledby={labelId}>
      <p
        id={labelId}
        className="text-xs font-semibold uppercase tracking-widest text-muted"
      >
        Select option
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const selected = variant.id === selectedId;
          const disabled = !variant.inStock;
          const label = disabled
            ? `${variant.name}, out of stock`
            : variant.name;
          return (
            <button
              key={variant.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(variant)}
              aria-pressed={selected}
              aria-label={label}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                selected
                  ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                  : "border-border hover:border-stone-400",
                disabled && "cursor-not-allowed opacity-40"
              )}
            >
              <span aria-hidden>{variant.name}</span>
              {!variant.inStock && (
                <span className="ml-1 text-muted" aria-hidden>
                  (Out of stock)
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
