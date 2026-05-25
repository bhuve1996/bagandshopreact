"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";
import type { ReviewView } from "@/services/reviews";

type Props = {
  reviews: ReviewView[];
};

export function Testimonials({ reviews }: Props) {
  const { homepage } = useStorefrontCopy();
  const section = homepage.testimonials;

  if (reviews.length === 0) return null;

  return (
    <section className="section-padding bg-stone-900 text-stone-100 dark:bg-stone-950">
      <div className="container-page">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          align="center"
          className="mb-12"
          titleClassName="text-stone-100"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((t, i) => (
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-stone-800/50 p-8"
            >
              <div className="mb-4 flex gap-0.5 text-amber-400">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} aria-hidden>
                    ★
                  </span>
                ))}
              </div>
              {t.title && (
                <p className="mb-2 text-sm font-medium text-stone-100">{t.title}</p>
              )}
              <p className="text-sm leading-relaxed text-stone-200">
                &ldquo;{t.content}&rdquo;
              </p>
              <footer className="mt-6">
                <cite className="not-italic">
                  <span className="text-sm font-semibold">{t.userName}</span>
                  {t.productName && t.productSlug && (
                    <Link
                      href={`/products/${t.productSlug}`}
                      className="mt-0.5 block text-xs text-stone-400 hover:text-stone-200 hover:underline"
                    >
                      {t.productName}
                    </Link>
                  )}
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
