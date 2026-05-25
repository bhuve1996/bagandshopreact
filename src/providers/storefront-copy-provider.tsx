"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_STOREFRONT_SETTINGS,
  type StorefrontSettings,
} from "@/types/storefront-settings";

const StorefrontCopyContext = createContext<StorefrontSettings>(
  DEFAULT_STOREFRONT_SETTINGS
);

export function StorefrontCopyProvider({
  settings,
  children,
}: {
  settings: StorefrontSettings;
  children: React.ReactNode;
}) {
  return (
    <StorefrontCopyContext.Provider value={settings}>
      {children}
    </StorefrontCopyContext.Provider>
  );
}

export function useStorefrontCopy() {
  return useContext(StorefrontCopyContext);
}
