"use client";

import { motion } from "framer-motion";
import { testimonials } from "@/lib/mock-data";

export function Testimonials() {
  return (
    <section className="section-padding bg-stone-900 text-stone-100 dark:bg-stone-950">
      <div className="container-page">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Loved by thousands
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">
            What our community says
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
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
                  <span key={j}>★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-stone-200">
                &ldquo;{t.content}&rdquo;
              </p>
              <footer className="mt-6">
                <cite className="not-italic">
                  <span className="text-sm font-semibold">{t.name}</span>
                  <span className="mt-0.5 block text-xs text-stone-400">
                    {t.role}
                  </span>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
