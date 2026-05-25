"use client";

import { useQuery } from "@tanstack/react-query";
import type { StorefrontSettings } from "@/types/storefront-settings";

export function useStorefrontSettings() {
  return useQuery({
    queryKey: ["storefront-settings"],
    queryFn: () =>
      fetch("/api/storefront/settings").then(
        (r) => r.json() as Promise<StorefrontSettings>
      ),
    staleTime: 5 * 60 * 1000,
  });
}
