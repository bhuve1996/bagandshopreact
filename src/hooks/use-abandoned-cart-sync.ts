"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore, useCartTotals } from "@/store/cart-store";

export function useAbandonedCartSync(email?: string) {
  const items = useCartStore((s) => s.items);
  const { subtotal } = useCartTotals();
  const { data: session } = useSession();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const contact = email ?? session?.user?.email;
    if (!contact) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch("/api/cart/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contact,
          items,
          subtotal,
        }),
      }).catch(() => {});
    }, 3000);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [items, subtotal, email, session?.user?.email]);
}
