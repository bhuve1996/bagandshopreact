"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
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
      : [images[0], images[0], images[0]];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const regionId = useId();
  const thumbsId = useId();

  useEffect(() => {
    setActive(0);
    setZoom(false);
  }, [images[0]]);

  const activeAlt =
    galleryImages.length > 1
      ? `${name}, image ${active + 1} of ${galleryImages.length}`
      : name;

  return (
    <div
      className="space-y-4"
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={regionId}
    >
      <h2 id={regionId} className="sr-only">
        {name} images
      </h2>
      <button
        id={`${regionId}-panel`}
        type="button"
        className={cn(
          "card-premium relative aspect-4/5 w-full overflow-hidden bg-stone-100 text-left focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
          zoom ? "cursor-zoom-out" : "cursor-zoom-in"
        )}
        onClick={() => setZoom((z) => !z)}
        aria-pressed={zoom}
        aria-label={
          zoom
            ? `Zoom out ${activeAlt}`
            : `Zoom in ${activeAlt}`
        }
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
              alt={activeAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
      </button>
      <div
        id={thumbsId}
        role="tablist"
        aria-label={`${name} image thumbnails`}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {galleryImages.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-controls={`${regionId}-panel`}
            onClick={() => {
              setActive(i);
              setZoom(false);
            }}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition-all focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
              active === i
                ? "ring-stone-900 dark:ring-stone-100"
                : "ring-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              aria-hidden
            />
            <span className="sr-only">
              Image {i + 1} of {galleryImages.length}
            </span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing image {active + 1} of {galleryImages.length}
      </p>
    </div>
  );
}
