"use client";

import { create } from "zustand";

type UIState = {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
};

export const useUIStore = create<UIState>((set, get) => ({
  mobileMenuOpen: false,
  searchOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),
  toggleSearch: () => set({ searchOpen: !get().searchOpen }),
}));
