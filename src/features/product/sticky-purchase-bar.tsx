"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

type StickyPurchaseBarProps = {
  product: Product;
  onAddToCart: () => void;
};

export function StickyPurchaseBar({
  product,
  onAddToCart,
}: StickyPurchaseBarProps) {
  const [visible, setVisible] = useState(false);

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
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md lg:hidden"
        >
          <div className="container-page flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-sm font-semibold">
                {formatPrice(product.price)}
              </p>
            </div>
            <Button onClick={onAddToCart}>Add to cart</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
