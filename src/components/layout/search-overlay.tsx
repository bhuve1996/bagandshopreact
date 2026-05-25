"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { trendingSearches } from "@/lib/mock-data";
import type { Product } from "@/types";
import { useUIStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/utils";

const RECENT_KEY = "bag-and-shop-recent-searches";

export function SearchOverlay() {
  const router = useRouter();
  const { searchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(RECENT_KEY);
    if (stored) setRecent(JSON.parse(stored) as string[]);
  }, [searchOpen]);

  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`)
        .then((r) => r.json())
        .then((d) => setResults(d.products ?? []))
        .catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  function saveRecent(term: string) {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-0 z-50 mx-auto max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-b-2xl bg-card shadow-2xl sm:top-8 sm:rounded-2xl"
            role="dialog"
            aria-label="Search"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-4">
              <Search className="h-5 w-5 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    saveRecent(query.trim());
                    setSearchOpen(false);
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  }
                }}
                placeholder="Search products, categories..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {query ? (
                <>
                  {results.length > 0 ? (
                    <ul className="space-y-2">
                      {results.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={() => {
                              saveRecent(p.name);
                              setSearchOpen(false);
                            }}
                            className="flex items-center gap-4 rounded-xl p-2 hover:bg-accent-muted"
                          >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                              <Image src={p.images[0]} alt="" fill className="object-cover" sizes="56px" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{p.name}</p>
                              <p className="text-xs text-muted">{formatPrice(p.price)}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted">No results found</p>
                  )}
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => {
                      saveRecent(query.trim());
                      setSearchOpen(false);
                    }}
                    className="mt-4 block text-center text-sm font-medium underline"
                  >
                    View all results
                  </Link>
                </>
              ) : (
                <div className="space-y-6">
                  {recent.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                        Recent
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setQuery(r)}
                            className="rounded-full bg-accent-muted px-3 py-1 text-xs"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                      Trending
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setQuery(t)}
                          className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent-muted"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
