"use client";

import type { AnalyticsTrackPayload } from "@/lib/analytics-events";

let cachedUserId: string | null | undefined;

export function setAnalyticsUserId(userId: string | null) {
  cachedUserId = userId;
}

export function trackAnalytics(payload: AnalyticsTrackPayload) {
  if (typeof window === "undefined") return;

  const body: AnalyticsTrackPayload = {
    ...payload,
    path: payload.path ?? window.location.pathname,
    userId: payload.userId ?? cachedUserId ?? undefined,
    metadata: {
      ...payload.metadata,
      referrer: document.referrer || undefined,
    },
  };

  const json = JSON.stringify(body);

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/track", blob)) return;
    }
  } catch {
    /* fall through to fetch */
  }

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => {});
}
