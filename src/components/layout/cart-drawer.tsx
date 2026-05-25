"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialogA11y } from "@/hooks/use-dialog-a11y";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";
import { useCartStore, useCartTotals } from "@/store/cart-store";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const { subtotal, itemCount } = useCartTotals();
  const panelRef = useRef<HTMLDivElement>(null);

  useDialogA11y(isOpen, closeCart, panelRef as RefObject<HTMLElement | null>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md bg-card shadow-2xl"
          >
            <div
              ref={panelRef}
              className="flex h-full min-h-0 flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-drawer-title"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <h2
                  id="cart-drawer-title"
                  className="text-lg font-semibold tracking-tight"
                >
                  Cart ({itemCount})
                </h2>
                <button
                  type="button"
                  onClick={closeCart}
                  className="rounded-full p-2 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted" strokeWidth={1} />
                  <p className="text-sm text-muted">Your cart is empty</p>
                  <Button onClick={closeCart} asChild>
                    <Link href="/collections">Continue shopping</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                    {items.map((item) => (
                      <li
                        key={`${item.productId}-${item.variantId ?? "default"}`}
                        className="flex gap-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                            aria-hidden
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="text-sm font-medium hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted">
                            {formatPrice(item.price)}
                          </p>
                          <div className="mt-auto flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const next = item.quantity - 1;
                                if (next <= 0) {
                                  removeItem(item.productId, item.variantId);
                                  toast.removedFromCart(item.name);
                                } else {
                                  updateQuantity(
                                    item.productId,
                                    next,
                                    item.variantId
                                  );
                                }
                              }}
                              className="rounded-full border border-border p-1 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus className="h-3 w-3" aria-hidden />
                            </button>
                            <span
                              className="w-6 text-center text-sm"
                              aria-live="polite"
                              aria-atomic="true"
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                  item.variantId
                                )
                              }
                              className="rounded-full border border-border p-1 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus className="h-3 w-3" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                removeItem(item.productId, item.variantId);
                                toast.removedFromCart(item.name);
                              }}
                              className="ml-auto text-xs text-muted hover:text-foreground focus-visible:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-4 border-t border-border px-6 py-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Subtotal</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <p className="text-xs text-muted">
                      Shipping & taxes calculated at checkout
                    </p>
                    <Button className="w-full" asChild>
                      <Link href="/checkout" onClick={closeCart}>
                        Checkout
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={closeCart}>
                      Continue shopping
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
