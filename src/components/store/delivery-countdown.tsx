"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import {
  formatCountdown,
  formatDeliveryDate,
  getDeliveryWindowState,
} from "@/lib/delivery-window";
import { useStorefrontSettings } from "@/hooks/use-storefront-settings";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function DeliveryCountdown({ className }: Props) {
  const { data: settings } = useStorefrontSettings();
  const countdown = settings?.delivery.countdown;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!countdown?.enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [countdown?.enabled]);

  const deliveryWindow = useMemo(() => {
    if (!countdown?.enabled) return null;
    return getDeliveryWindowState(
      countdown.cutoffHour,
      countdown.cutoffMinute,
      countdown.minDays,
      countdown.maxDays,
      new Date(now)
    );
  }, [countdown, now]);

  if (!countdown?.enabled || !deliveryWindow) {
    return null;
  }

  const timer = formatCountdown(deliveryWindow.remainingMs);
  const from = formatDeliveryDate(deliveryWindow.deliveryFrom);
  const to = formatDeliveryDate(deliveryWindow.deliveryTo);

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm leading-relaxed dark:border-amber-900/50 dark:bg-amber-950/30",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-3">
        <Clock
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400"
          aria-hidden
        />
        <p>
          Order{" "}
          <span className="font-semibold">{deliveryWindow.orderDayLabel}</span> within{" "}
          <span
            className="font-mono text-base font-semibold tabular-nums tracking-tight text-amber-900 dark:text-amber-200"
            aria-label={`${timer} remaining`}
          >
            {timer}
          </span>
          , you&apos;ll receive your package between{" "}
          <span className="font-semibold">{from}</span> to{" "}
          <span className="font-semibold">{to}</span>
        </p>
      </div>
    </div>
  );
}
