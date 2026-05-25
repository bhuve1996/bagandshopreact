"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductAccordionProps = {
  description: string;
};

export function ProductAccordion({ description }: ProductAccordionProps) {
  const items = [
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
      title: "Shipping & returns",
      content:
        "Free shipping on orders above ₹999. Standard delivery 2–5 business days. Easy 15-day returns for unused items in original packaging.",
    },
    {
      title: "Reviews",
      content:
        "Reviews are moderated before publishing. Purchased customers can leave ratings from their order history.",
    },
  ];

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
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm text-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="pb-4 leading-relaxed">{item.content}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
