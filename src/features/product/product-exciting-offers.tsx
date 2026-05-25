"use client";

import { BadgePercent, Check } from "lucide-react";
import Link from "next/link";
import { useStorefrontSettings } from "@/hooks/use-storefront-settings";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getActiveProductOffers } from "@/types/storefront-settings";

type Props = {
  className?: string;
};

export function ProductExcitingOffers({ className }: Props) {
  const { data: settings } = useStorefrontSettings();
  const offers = getActiveProductOffers(settings);
  const title = settings?.productOffers?.title?.trim() || "EXCITING OFFERS";

  if (offers.length === 0) return null;

  return (
    <section
      className={cn(
        "mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/25",
        className
      )}
      aria-label={title}
    >
      <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-900 dark:text-amber-200">
        <BadgePercent className="h-4 w-4 shrink-0" aria-hidden />
        {title}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {offers.map((offer) => (
          <li
            key={offer.id}
            className="flex gap-2 text-sm leading-snug text-foreground"
          >
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500"
              aria-hidden
            />
            <span>
              {offer.text.trim()}
              {offer.minOrderAmount != null &&
                offer.minOrderAmount > 0 &&
                !offer.text.includes("₹") && (
                  <span className="text-muted">
                    {" "}
                    (orders above {formatPrice(offer.minOrderAmount)})
                  </span>
                )}
              {offer.couponCode?.trim() && (
                <>
                  {" "}
                  <Link
                    href={`/checkout?coupon=${encodeURIComponent(offer.couponCode.trim().toUpperCase())}`}
                    className="font-medium text-amber-800 underline underline-offset-2 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100"
                  >
                    Use {offer.couponCode.trim().toUpperCase()}
                  </Link>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
