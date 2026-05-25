"use client";

import { cn } from "@/lib/utils";

export type PLPFilterState = {
  minPrice?: number;
  maxPrice?: number;
  tags: string[];
  sort: "newest" | "price-asc" | "price-desc" | "rating" | "popular";
};

type PLPFiltersProps = {
  filters: PLPFilterState;
  onChange: (filters: PLPFilterState) => void;
  availableTags?: string[];
  className?: string;
};

const SORT_OPTIONS: { value: PLPFilterState["sort"]; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
];

const PRICE_RANGES = [
  { label: "Under ₹999", min: 0, max: 999 },
  { label: "₹999 – ₹1999", min: 999, max: 1999 },
  { label: "₹1999+", min: 1999, max: undefined as number | undefined },
];

const DEFAULT_TAGS = ["bestseller", "new", "vegan", "bundle", "travel", "desk"];

export function PLPFilters({
  filters,
  onChange,
  availableTags = DEFAULT_TAGS,
  className,
}: PLPFiltersProps) {
  return (
    <aside className={cn("space-y-8", className)}>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Sort
        </h3>
        <ul className="mt-3 space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="sort"
                  checked={filters.sort === opt.value}
                  onChange={() => onChange({ ...filters, sort: opt.value })}
                  className="accent-stone-900"
                />
                {opt.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Price
        </h3>
        <ul className="mt-3 space-y-2">
          <li>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="price"
                checked={filters.minPrice == null && filters.maxPrice == null}
                onChange={() =>
                  onChange({ ...filters, minPrice: undefined, maxPrice: undefined })
                }
                className="accent-stone-900"
              />
              All prices
            </label>
          </li>
          {PRICE_RANGES.map((range) => (
            <li key={range.label}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="price"
                  checked={
                    filters.minPrice === range.min &&
                    filters.maxPrice === range.max
                  }
                  onChange={() =>
                    onChange({
                      ...filters,
                      minPrice: range.min,
                      maxPrice: range.max,
                    })
                  }
                  className="accent-stone-900"
                />
                {range.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Tags
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const active = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const tags = active
                    ? filters.tags.filter((t) => t !== tag)
                    : [...filters.tags, tag];
                  onChange({ ...filters, tags });
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs capitalize transition-colors",
                  active
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "border border-border hover:bg-accent-muted"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
