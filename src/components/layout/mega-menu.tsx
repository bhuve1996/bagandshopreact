"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { NavItem } from "@/types";

type MegaMenuProps = {
  item: NavItem | null;
  open: boolean;
};

export function MegaMenu({ item, open }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          id="mega-menu-panel"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 right-0 top-full z-40 hidden border-b border-border bg-card/95 shadow-lg backdrop-blur-md lg:block"
          role="region"
          aria-label={item ? `${item.label} menu` : undefined}
        >
          <div className="container-page grid grid-cols-12 gap-8 py-8">
            <div className="col-span-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                {item.label}
              </p>
              {item.children && item.children.length > 0 ? (
                <ul className="space-y-2">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="flex items-baseline justify-between gap-4 text-sm text-foreground transition-colors hover:text-muted"
                      >
                        <span>{child.label}</span>
                        {child.productCount != null && (
                          <span className="text-xs text-muted tabular-nums">
                            {child.productCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">
                  Curated pieces for everyday carry and home.
                </p>
              )}
              <Link
                href={item.href}
                className="inline-block text-sm font-medium underline-offset-4 hover:underline"
              >
                {item.children?.length
                  ? `View all ${item.label}`
                  : `Browse ${item.label}`}
              </Link>
            </div>
            {item.banner ? (
              <Link
                href={item.banner.href}
                className="group relative col-span-8 overflow-hidden rounded-2xl"
              >
                <div className="relative aspect-21/9">
                  <Image
                    src={item.banner.image}
                    alt=""
                    fill
                    aria-hidden
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="60vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-stone-900/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-xs uppercase tracking-widest opacity-80">
                      {item.banner.subtitle}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                      {item.banner.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ) : (
              <div
                className="col-span-8 rounded-2xl border border-dashed border-border bg-stone-50/80 dark:bg-stone-900/40"
                aria-hidden
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
