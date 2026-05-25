import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Clock,
  Gift,
  Headphones,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { TrustBenefitConfig, TrustBenefitIconKey } from "@/types/storefront-settings";

export const TRUST_BENEFIT_ICON_OPTIONS: {
  value: TrustBenefitIconKey;
  label: string;
}[] = [
  { value: "truck", label: "Delivery (truck)" },
  { value: "banknote", label: "Cash (banknote)" },
  { value: "rotate-ccw", label: "Returns (rotate)" },
  { value: "shield-check", label: "Secure (shield)" },
  { value: "headphones", label: "Support (headphones)" },
  { value: "package", label: "Package" },
  { value: "gift", label: "Gift" },
  { value: "clock", label: "Clock" },
];

const ICON_MAP: Record<TrustBenefitIconKey, LucideIcon> = {
  truck: Truck,
  banknote: Banknote,
  "rotate-ccw": RotateCcw,
  "shield-check": ShieldCheck,
  headphones: Headphones,
  package: Package,
  gift: Gift,
  clock: Clock,
};

export function getTrustBenefitIcon(key: TrustBenefitIconKey): LucideIcon {
  return ICON_MAP[key] ?? Truck;
}

export type ResolvedTrustBenefit = TrustBenefitConfig & { Icon: LucideIcon };

export function resolveTrustBenefits(
  items: TrustBenefitConfig[]
): ResolvedTrustBenefit[] {
  return items
    .filter((item) => item.enabled)
    .map((item) => ({
      ...item,
      Icon: getTrustBenefitIcon(item.icon),
    }));
}
