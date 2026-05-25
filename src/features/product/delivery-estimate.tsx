"use client";

import { Truck } from "lucide-react";
import { useStorefrontSettings } from "@/hooks/use-storefront-settings";
import { cn } from "@/lib/utils";

export function DeliveryEstimate({ className }: { className?: string }) {
  const { data: settings } = useStorefrontSettings();

  if (!settings?.delivery.showOnPdp || !settings.delivery.estimateText) {
    return null;
  }

  return (
    <p
      className={cn(
        "mt-4 flex items-center gap-2 text-sm text-muted",
        className
      )}
    >
      <Truck className="h-4 w-4 shrink-0" aria-hidden />
      {settings.delivery.estimateText}
    </p>
  );
}
