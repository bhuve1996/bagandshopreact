"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { setAnalyticsUserId, trackAnalytics } from "@/lib/analytics-client";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    setAnalyticsUserId(session?.user?.id ?? null);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    trackAnalytics({
      type: AnalyticsEventType.PAGE_VIEW,
      path: pathname,
    });
  }, [pathname]);

  return null;
}
