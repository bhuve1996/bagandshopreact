"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";

export function Newsletter() {
  const { homepage } = useStorefrontCopy();
  const section = homepage.newsletter;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const emailId = useId();

  return (
    <section className="section-padding" aria-labelledby="newsletter-heading">
      <div className="container-page">
        <div className="card-premium mx-auto max-w-2xl px-8 py-12 text-center md:px-16">
          <SectionHeading
            headingId="newsletter-heading"
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
            align="center"
            className="mb-0"
            titleClassName="md:text-3xl"
          />
          {submitted ? (
            <p
              role="status"
              className="mt-8 text-sm font-medium text-success"
            >
              {section.successMessage}
            </p>
          ) : (
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <label htmlFor={emailId} className="sr-only">
                Email address
              </label>
              <input
                id={emailId}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={section.emailPlaceholder}
                autoComplete="email"
                className="h-11 flex-1 rounded-full border border-border bg-background px-5 text-sm focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 sm:max-w-xs"
              />
              <Button type="submit" size="lg">
                {section.subscribeButton}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
