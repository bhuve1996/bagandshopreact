import Link from "next/link";
import { cn } from "@/lib/utils";

type ProductTagsProps = {
  tags: string[];
  className?: string;
};

export function ProductTags({ tags, className }: ProductTagsProps) {
  const visible = tags.map((t) => t.trim()).filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <div className={cn("mt-4", className)}>
      <h2 className="sr-only">Product tags</h2>
      <ul className="flex flex-wrap gap-2" aria-label="Product tags">
        {visible.map((tag) => (
          <li key={tag}>
            <Link
              href={`/search?tag=${encodeURIComponent(tag)}`}
              className="inline-block rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-stone-400 hover:bg-stone-50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:border-stone-600 dark:hover:bg-stone-900"
            >
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
