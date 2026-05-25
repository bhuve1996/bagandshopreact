"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const galleryImages =
    images.length > 1
      ? images
      : [
          images[0],
          images[0],
          images[0],
        ];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "card-premium relative aspect-4/5 cursor-zoom-in overflow-hidden bg-stone-100",
          zoom && "cursor-zoom-out"
        )}
        onClick={() => setZoom((z) => !z)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute inset-0 transition-transform duration-300",
              zoom && "scale-150"
            )}
          >
            <Image
              src={galleryImages[active]}
              alt={name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {galleryImages.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition-all",
              active === i
                ? "ring-stone-900 dark:ring-stone-100"
                : "ring-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>
    </div>
  );
}
