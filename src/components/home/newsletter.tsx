"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="card-premium mx-auto max-w-2xl px-8 py-12 text-center md:px-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Newsletter
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Early access to drops & offers
          </h2>
          <p className="mt-2 text-sm text-muted">
            Join 50,000+ design lovers. Unsubscribe anytime.
          </p>
          {submitted ? (
            <p className="mt-8 text-sm font-medium text-accent">
              Thanks — you&apos;re on the list.
            </p>
          ) : (
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-11 flex-1 rounded-full border border-border bg-background px-5 text-sm outline-none focus:ring-2 focus:ring-stone-300 sm:max-w-xs"
              />
              <Button type="submit" size="lg">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
