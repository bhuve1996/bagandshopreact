"use client";

import { useAbandonedCartSync } from "@/hooks/use-abandoned-cart-sync";

export function CartSync() {
  useAbandonedCartSync();
  return null;
}
