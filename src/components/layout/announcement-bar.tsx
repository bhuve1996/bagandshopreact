"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";

export function AnnouncementBar() {
  const { brand } = useStorefrontCopy();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative bg-stone-900 text-center text-xs text-stone-100 dark:bg-stone-100 dark:text-stone-900"
    >
      <div className="container-page flex h-9 items-center justify-center">
        <p className="truncate px-8">
          {brand.announcement}{" "}
          <Link
            href={brand.announcementHref}
            className="underline underline-offset-2"
          >
            {brand.announcementLinkText}
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-4 rounded-full p-1 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 dark:hover:bg-black/10 dark:focus-visible:ring-stone-900 dark:focus-visible:ring-offset-stone-100"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
