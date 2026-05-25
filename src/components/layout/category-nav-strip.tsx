import Link from "next/link";
import type { NavItem } from "@/types";

type Props = { categories: NavItem[] };

/** Quick category access on viewports where the full nav is collapsed. */
export function CategoryNavStrip({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Categories"
      className="border-b border-border bg-background/95 lg:hidden"
    >
      <div className="container-page scrollbar-none flex gap-2 overflow-x-auto py-2.5">
        {categories.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-stone-400 hover:bg-stone-50 dark:hover:border-stone-600 dark:hover:bg-stone-900"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/collections"
          className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted underline-offset-4 hover:underline"
        >
          Shop all
        </Link>
      </div>
    </nav>
  );
}
