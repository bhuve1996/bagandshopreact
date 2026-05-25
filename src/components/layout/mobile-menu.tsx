"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { navigation } from "@/lib/mock-data";
import { useUIStore } from "@/store/ui-store";

export function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 top-0 z-50 flex w-[min(100%,320px)] flex-col bg-card shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-sm font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-2 hover:bg-stone-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-4">
              {navigation.map((item) => (
                <li key={item.label} className="border-b border-border py-3">
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between text-base font-medium"
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </Link>
                  {item.children && (
                    <ul className="mt-2 space-y-2 pl-2">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm text-muted"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-border p-4">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm"
              >
                Account
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm"
              >
                Wishlist
              </Link>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
