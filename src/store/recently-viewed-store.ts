"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type RecentlyViewedState = {
  slugs: string[];
  add: (slug: string) => void;
};

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      slugs: [],
      add: (slug) => {
        const next = [slug, ...get().slugs.filter((s) => s !== slug)].slice(0, 8);
        set({ slugs: next });
      },
    }),
    { name: "bag-and-shop-recent" }
  )
);
