"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { defaultSiteVideos } from "@/lib/default-site-videos";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";
import type { SiteVideoSlide } from "@/services/site-videos";

const AUTO_ADVANCE_MS = 8000;

async function fetchSiteVideos(): Promise<SiteVideoSlide[]> {
  const res = await fetch("/api/videos");
  if (!res.ok) return defaultSiteVideos;
  const data = (await res.json()) as SiteVideoSlide[];
  return Array.isArray(data) && data.length > 0 ? data : defaultSiteVideos;
}

type Props = {
  initialSlides?: SiteVideoSlide[];
};

export function VideoCarousel({ initialSlides }: Props) {
  const { homepage } = useStorefrontCopy();
  const section = homepage.videos;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollRaf = useRef<number | null>(null);

  const fallbackSlides = useMemo(
    () =>
      initialSlides && initialSlides.length > 0
        ? initialSlides
        : defaultSiteVideos,
    [initialSlides]
  );

  const { data } = useQuery({
    queryKey: ["site-videos"],
    queryFn: fetchSiteVideos,
    initialData: fallbackSlides,
    placeholderData: fallbackSlides,
  });

  const slides = data && data.length > 0 ? data : defaultSiteVideos;

  const scrollToIndex = useCallback(
    (i: number, behavior: ScrollBehavior = "smooth") => {
      const card = cardRefs.current[i];
      card?.scrollIntoView({
        behavior: reducedMotion ? "auto" : behavior,
        inline: "center",
        block: "nearest",
      });
    },
    [reducedMotion]
  );

  const syncIndexFromScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const center = container.scrollLeft + container.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setIndex((prev) => (prev === closest ? prev : closest));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === index && !paused && !reducedMotion) {
        void el.play().catch(() => {});
      } else {
        el.pause();
        if (i !== index) el.currentTime = 0;
      }
    });
  }, [index, paused, reducedMotion]);

  useEffect(() => {
    if (slides.length === 0 || paused || reducedMotion) return;
    const timer = setInterval(() => {
      const next = (index + 1) % slides.length;
      setIndex(next);
      scrollToIndex(next);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [slides.length, paused, reducedMotion, index, scrollToIndex]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
      scrollRaf.current = requestAnimationFrame(syncIndexFromScroll);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    };
  }, [syncIndexFromScroll, slides.length]);

  useEffect(() => {
    if (index >= slides.length && slides.length > 0) setIndex(0);
  }, [index, slides.length]);

  if (slides.length === 0) return null;

  const go = (delta: number) => {
    const next = (index + delta + slides.length) % slides.length;
    setIndex(next);
    scrollToIndex(next);
  };

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  return (
    <section
      className="section-padding border-y border-border bg-stone-100 dark:bg-stone-950"
      aria-roledescription="carousel"
      aria-label="Brand video reels"
    >
      <div className="container-page">
        <SectionHeading
          headingId="homepage-videos-heading"
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          titleClassName="sm:text-4xl"
        />

        <div className="relative">
          {slides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-card/95 p-2.5 shadow-md ring-1 ring-border hover:bg-card focus-visible:ring-2 focus-visible:ring-foreground md:flex"
                aria-label="Previous reel"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-card/95 p-2.5 shadow-md ring-1 ring-border hover:bg-card focus-visible:ring-2 focus-visible:ring-foreground md:flex"
                aria-label="Next reel"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </>
          ) : null}

          <div
            ref={scrollRef}
            tabIndex={0}
            role="group"
            aria-label="Video reels"
            aria-live="polite"
            onKeyDown={onKeyDown}
            className={cn(
              "flex gap-4 overflow-x-auto overscroll-x-contain py-2",
              "snap-x snap-mandatory scroll-smooth",
              "scrollbar-none",
              "px-[max(1rem,calc(50%-min(42vw,9.5rem)))] sm:px-[max(1.5rem,calc(50%-10.5rem))]"
            )}
          >
            {slides.map((s, i) => {
              const active = i === index;
              return (
                <article
                  key={s.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${slides.length}: ${s.title}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "w-[min(78vw,17rem)] shrink-0 snap-center transition-[transform,opacity] duration-300 sm:w-[min(42vw,19rem)]",
                    active
                      ? "scale-100 opacity-100"
                      : "scale-[0.92] opacity-70"
                  )}
                >
                  <div
                    className={cn(
                      "card-premium relative overflow-hidden rounded-3xl bg-stone-900 shadow-lg ring-1 ring-stone-900/10 transition-shadow duration-300",
                      active && "shadow-xl ring-2 ring-stone-900/20 dark:ring-stone-100/20"
                    )}
                  >
                    <div className="relative aspect-9/16 max-h-[min(72vh,520px)] w-full">
                      {s.poster ? (
                        <Image
                          src={s.poster}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 78vw, 19rem"
                          priority={i === 0}
                          aria-hidden
                        />
                      ) : null}
                      <video
                        ref={(el) => {
                          videoRefs.current[i] = el;
                        }}
                        src={s.src}
                        poster={s.poster}
                        className="relative z-10 h-full w-full object-cover"
                        muted
                        playsInline
                        loop
                        preload={active ? "auto" : "metadata"}
                        controls={reducedMotion}
                        aria-label={s.title}
                      />
                      <div className="pointer-events-none absolute inset-0 z-20 bg-linear-to-t from-stone-900/75 via-transparent to-stone-900/10" />

                      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 text-white">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
                          {s.title}
                        </p>
                        {s.href ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="mt-3 h-8 bg-white/95 text-stone-900 hover:bg-white"
                            asChild
                          >
                            <Link href={s.href}>{section.learnMore}</Link>
                          </Button>
                        ) : null}
                      </div>

                      {active && slides.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setPaused((p) => !p)}
                          className="absolute right-3 top-3 z-30 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white"
                          aria-label={
                            paused ? "Resume reel playback" : "Pause reel playback"
                          }
                        >
                          {paused ? (
                            <Play className="h-4 w-4" aria-hidden />
                          ) : (
                            <Pause className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {slides.length > 1 ? (
            <div
              className="mt-6 flex justify-center gap-2"
              role="tablist"
              aria-label="Choose reel"
            >
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Reel ${i + 1}: ${s.title}`}
                  onClick={() => {
                    setIndex(i);
                    scrollToIndex(i);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                    i === index
                      ? "w-6 bg-stone-900 dark:bg-stone-100"
                      : "w-2 bg-stone-400"
                  )}
                />
              ))}
            </div>
          ) : null}

          <p className="mt-3 text-center text-xs text-muted sm:hidden">
            Swipe sideways to browse reels
          </p>
        </div>
      </div>
    </section>
  );
}
