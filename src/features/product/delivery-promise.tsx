"use client";

import { Truck } from "lucide-react";
import { DeliveryCountdown } from "@/components/store/delivery-countdown";
import { useStorefrontSettings } from "@/hooks/use-storefront-settings";
import { cn } from "@/lib/utils";
import { formatDeliveryEstimateText } from "@/types/storefront-settings";

export function DeliveryPromise({ className }: { className?: string }) {
  const { data: settings } = useStorefrontSettings();
  const delivery = settings?.delivery;

  if (!delivery?.showOnPdp) return null;

  const showCountdown = delivery.countdown?.enabled;
  const estimateLine =
    delivery.estimateText?.trim() ||
    (delivery.countdown
      ? formatDeliveryEstimateText(
          delivery.countdown.minDays,
          delivery.countdown.maxDays
        )
      : "");
  const showEstimate = Boolean(estimateLine);

  if (!showEstimate && !showCountdown) return null;

  return (
    <div className={cn("mt-4 space-y-3", className)}>
      {showCountdown && <DeliveryCountdown />}
      {showEstimate && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Truck className="h-4 w-4 shrink-0" aria-hidden />
          {estimateLine}
        </p>
      )}
    </div>
  );
}
