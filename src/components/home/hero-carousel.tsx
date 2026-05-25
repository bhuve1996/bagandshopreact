"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { BannerSlide } from "@/services/banners";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const { data: slides = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: () =>
      fetch("/api/banners").then((r) => r.json() as Promise<BannerSlide[]>),
  });

  useEffect(() => {
    if (slides.length === 0 || paused) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

  const showContent = slide.showContent;

  return (
    <section
      className="relative overflow-hidden bg-stone-100 dark:bg-stone-900"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div className="relative aspect-4/5 sm:aspect-video lg:aspect-21/9">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={showContent ? "" : slide.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
              aria-hidden={showContent}
            />
            {showContent ? (
              <div className="absolute inset-0 bg-linear-to-t from-stone-900/70 via-stone-900/20 to-transparent sm:bg-linear-to-r sm:from-stone-900/60 sm:via-stone-900/25 sm:to-transparent" />
            ) : null}
            {!showContent ? (
              <Link
                href={slide.href}
                className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
              >
                <span className="sr-only">{slide.title}</span>
              </Link>
            ) : null}
          </motion.div>
        </AnimatePresence>
        {showContent ? (
          <div className="container-page absolute inset-0 flex flex-col justify-end pb-12 sm:justify-center sm:pb-0">
            <motion.div
              key={slide.id + "-text"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="max-w-lg text-white"
              aria-live="polite"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                {slide.subtitle}
              </p>
              <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              <Button className="mt-8" size="lg" asChild>
                <Link href={slide.href}>{slide.cta}</Link>
              </Button>
            </motion.div>
          </div>
        ) : null}
        <div className="absolute bottom-6 right-4 flex gap-2 sm:right-8">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
            aria-label={paused ? "Resume carousel" : "Pause carousel"}
          >
            {paused ? (
              <Play className="h-5 w-5" aria-hidden />
            ) : (
              <Pause className="h-5 w-5" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              setIndex((i) => (i - 1 + slides.length) % slides.length)
            }
            className="rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 sm:left-auto sm:right-24 sm:translate-x-0"
          role="tablist"
          aria-label="Choose slide"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1} of ${slides.length}: ${s.title}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 ${
                i === index ? "w-8 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
