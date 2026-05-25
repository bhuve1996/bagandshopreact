"use client";

import { useEffect, useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";
import { formatPrice } from "@/lib/utils";

type StickyPurchaseBarProps = {
  productName: string;
  price: number;
  onAddToCart: () => void;
};

export function StickyPurchaseBar({
  productName,
  price,
  onAddToCart,
}: StickyPurchaseBarProps) {
  const { labels } = useStorefrontCopy();
  const [visible, setVisible] = useState(false);
  const labelId = useId();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          role="region"
          aria-labelledby={labelId}
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md lg:hidden"
        >
          <h2 id={labelId} className="sr-only">
            Quick purchase for {productName}
          </h2>
          <div className="container-page flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{productName}</p>
              <p className="text-sm font-semibold">{formatPrice(price)}</p>
            </div>
            <Button
              onClick={onAddToCart}
              aria-label={`Add ${productName} to cart`}
            >
              {labels.addToCart}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
