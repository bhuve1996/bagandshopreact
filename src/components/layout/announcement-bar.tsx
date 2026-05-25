"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/lib/mock-data";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-stone-900 text-center text-xs text-stone-100 dark:bg-stone-100 dark:text-stone-900">
      <div className="container-page flex h-9 items-center justify-center">
        <p className="truncate px-8">
          {siteConfig.announcement}{" "}
          <Link href="/collections/new-arrivals" className="underline underline-offset-2">
            Shop now
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-4 rounded-full p-1 hover:bg-white/10 dark:hover:bg-black/10"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
