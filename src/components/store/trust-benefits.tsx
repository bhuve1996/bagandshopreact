import { resolveTrustBenefits } from "@/lib/trust-benefits";
import type { TrustBenefitConfig } from "@/types/storefront-settings";
import { cn } from "@/lib/utils";

type Props = {
  items: TrustBenefitConfig[];
  variant?: "banner" | "compact";
  className?: string;
};

export function TrustBenefits({ items, variant = "banner", className }: Props) {
  const benefits = resolveTrustBenefits(items);

  if (benefits.length === 0) return null;

  if (variant === "compact") {
    return (
      <ul
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
          className
        )}
        aria-label="Shopping benefits"
      >
        {benefits.map((item) => (
          <li
            key={item.id}
            className="flex gap-2.5 rounded-xl border border-border bg-card p-3"
          >
            <item.Icon
              className="h-5 w-5 shrink-0 text-foreground"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-xs font-medium leading-tight">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">
                {item.subtitle}
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section
      className={cn(
        "section-padding border-y border-border bg-stone-50 dark:bg-stone-900/40",
        className
      )}
      aria-label="Shopping benefits"
    >
      <div className="container-page">
        <ul
          className={cn(
            "grid gap-4",
            benefits.length >= 5
              ? "sm:grid-cols-2 lg:grid-cols-5"
              : "sm:grid-cols-2 md:grid-cols-3"
          )}
        >
          {benefits.map((item) => (
            <li
              key={item.id}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-5 text-center sm:items-start sm:text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
                <item.Icon className="h-5 w-5 text-foreground" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted">{item.subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
