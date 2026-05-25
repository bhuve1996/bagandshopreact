"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { POLICY_PATH_BY_SLUG } from "@/lib/policy-pages";
import { cn } from "@/lib/utils";
import type { ProductFaq } from "@/types";

function DeliveryReturnsContent() {
  const deliveryItems = [
    {
      term: "Delivery",
      detail: "Ships within 24 hours.",
    },
    {
      term: "Free shipping",
      detail:
        "Free shipping on orders above ₹1199. A charge of ₹79 is applied to all orders of ₹1199 and below.",
    },
    {
      term: "Cash on delivery",
      detail: "₹99 extra charges for all Cash On Delivery orders.",
    },
  ];

  const returnItems = [
    {
      detail:
        "30 days no-questions-asked return or replacement. The product should be unused and in original condition with brand packaging.",
    },
    {
      detail:
        "6 months replacement in case of manufacturing defects or functionality issues.",
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
          Delivery
        </h3>
        <dl className="mt-3 space-y-4">
          {deliveryItems.map((item) => (
            <div key={item.term}>
              <dt className="font-medium text-foreground">{item.term}</dt>
              <dd className="mt-1.5 leading-relaxed">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
          Returns
        </h3>
        <ul className="mt-3 list-none space-y-3">
          {returnItems.map((item) => (
            <li key={item.detail} className="leading-relaxed">
              {item.detail}
            </li>
          ))}
        </ul>
      </section>
      <p className="leading-relaxed">
        For more information, check out our{" "}
        <Link
          href={POLICY_PATH_BY_SLUG.shipping}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Shipping Policy
        </Link>{" "}
        and{" "}
        <Link
          href={POLICY_PATH_BY_SLUG.returns}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Return and Exchange Policy
        </Link>{" "}
        pages.
      </p>
    </div>
  );
}

type ProductAccordionProps = {
  description: string;
  faqs?: ProductFaq[];
};

export function ProductAccordion({ description, faqs = [] }: ProductAccordionProps) {
  const items: { title: string; content: ReactNode }[] = [
    {
      title: "Description",
      content: description,
    },
    {
      title: "Features",
      content:
        "Premium materials · Thoughtful design · 15-day returns · 1-year warranty on manufacturing defects.",
    },
    {
      title: "Delivery time & returns",
      content: <DeliveryReturnsContent />,
    },
    {
      title: "Reviews",
      content:
        "Reviews are moderated before publishing. Purchased customers can leave ratings from their order history.",
    },
  ];

  if (faqs.length > 0) {
    items.splice(1, 0, {
      title: "Questions & answers",
      content: (
        <dl className="space-y-5">
          {faqs.map((f) => (
            <div key={f.id}>
              <dt className="font-medium text-foreground">{f.question}</dt>
              <dd className="mt-1.5 leading-relaxed">{f.answer}</dd>
            </div>
          ))}
        </dl>
      ),
    });
  }

  return (
    <Accordion.Root type="single" collapsible className="mt-10 border-t border-border">
      {items.map((item) => (
        <Accordion.Item key={item.title} value={item.title} className="border-b border-border">
          <Accordion.Header>
            <Accordion.Trigger
              className={cn(
                "group flex w-full items-center justify-between py-4 text-left text-sm font-medium",
                "hover:text-muted"
              )}
            >
              {item.title}
              <ChevronDown
                className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm text-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            {typeof item.content === "string" ? (
              <p className="pb-4 leading-relaxed whitespace-pre-line">{item.content}</p>
            ) : (
              <div className="pb-4">{item.content}</div>
            )}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
