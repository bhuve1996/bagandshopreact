"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { useDialogA11y } from "@/hooks/use-dialog-a11y";
import { useUIStore } from "@/store/ui-store";
import type { NavItem } from "@/types";

type MobileMenuProps = {
  navigation: NavItem[];
  categoryNav: NavItem[];
};

export function MobileMenu({ navigation, categoryNav }: MobileMenuProps) {
  const { data: session } = useSession();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => setMobileMenuOpen(false);

  useDialogA11y(mobileMenuOpen, close, panelRef);

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 lg:hidden"
          >
            <button
              type="button"
              className="h-full w-full"
              onClick={close}
              aria-label="Close menu"
            />
          </motion.div>
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 top-0 z-50 flex w-[min(100%,320px)] flex-col bg-card shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div ref={panelRef} className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span id="mobile-menu-title" className="text-sm font-semibold">
                Menu
              </span>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {categoryNav.length > 0 && (
              <div className="border-b border-border px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Categories
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {categoryNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ul className="flex-1 overflow-y-auto p-4" aria-label="Site navigation">
              {navigation.map((item) => (
                <li key={item.label} className="border-b border-border py-3">
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex items-center justify-between text-base font-medium"
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
                  </Link>
                  {item.children && (
                    <ul className="mt-2 space-y-2 pl-2" aria-label={`${item.label} sublinks`}>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={close}
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
                href={session ? "/account" : "/login"}
                onClick={close}
                className="block text-sm"
              >
                {session ? "Account" : "Sign in"}
              </Link>
              <Link
                href="/wishlist"
                onClick={close}
                className="block text-sm"
              >
                Wishlist
              </Link>
              {session && (
                <SignOutButton
                  variant="ghost"
                  size="sm"
                  className="h-auto w-full justify-start px-0 text-sm font-normal text-muted hover:text-foreground"
                  onSignedOut={close}
                />
              )}
            </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
