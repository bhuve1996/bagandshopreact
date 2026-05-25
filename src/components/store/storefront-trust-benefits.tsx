"use client";

import { TrustBenefits } from "@/components/store/trust-benefits";
import { useStorefrontSettings } from "@/hooks/use-storefront-settings";
import { cn } from "@/lib/utils";
import { DEFAULT_TRUST_BENEFIT_ITEMS } from "@/types/storefront-settings";

type Props = {
  placement: "homepage" | "pdp" | "checkout";
  className?: string;
};

export function StorefrontTrustBenefits({
  placement,
  className,
}: Props) {
  const { data: settings } = useStorefrontSettings();
  const badges = settings?.delivery.trustBadges;

  if (!badges?.enabled) return null;

  const show =
    (placement === "homepage" && badges.showOnHomepage) ||
    (placement === "pdp" && badges.showOnPdp) ||
    (placement === "checkout" && badges.showOnCheckout);

  if (!show) return null;

  return (
    <TrustBenefits
      items={badges.items ?? DEFAULT_TRUST_BENEFIT_ITEMS}
      variant={placement === "homepage" ? "banner" : "compact"}
      className={cn(className)}
    />
  );
}
