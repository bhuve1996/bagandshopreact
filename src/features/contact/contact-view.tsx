"use client";

import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackAnalytics } from "@/lib/analytics-client";
import { externalLinkLabel } from "@/lib/a11y";
import { whatsappShareUrl } from "@/lib/share";
import {
  getWhatsAppDefaultMessage,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";
import type { StorefrontSettings } from "@/types/storefront-settings";

type ContactViewProps = {
  support: StorefrontSettings["support"];
};

export function ContactView({ support }: ContactViewProps) {
  const whatsapp = normalizeWhatsAppNumber(support.whatsappNumber);
  const waMessage = getWhatsAppDefaultMessage(support);

  return (
    <div className="section-padding">
      <div className="container-page max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-4 text-muted">
          Email us at{" "}
          <a
            href={`mailto:${support.email}`}
            className="underline"
            onClick={() =>
              trackAnalytics({ type: AnalyticsEventType.CONTACT_CLICK })
            }
          >
            {support.email}
          </a>
        </p>
        {support.phone && (
          <p className="mt-2 text-muted">
            Phone:{" "}
            <a href={`tel:${support.phone}`} className="underline">
              {support.phone}
            </a>
          </p>
        )}
        {support.hours && (
          <p className="mt-2 text-sm text-muted">{support.hours}</p>
        )}
        {whatsapp && (
          <a
            href={whatsappShareUrl(whatsapp, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackAnalytics({
                type: AnalyticsEventType.HELP_WHATSAPP,
                metadata: { source: "contact" },
              })
            }
            aria-label={externalLinkLabel("Message on WhatsApp")}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
          >
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
            Message on WhatsApp
          </a>
        )}
        <p className="mt-8 text-sm text-muted">
          Prefer self-service?{" "}
          <Link href="/faq" className="underline">
            Read the FAQ
          </Link>{" "}
          or use the shop assistant on any page.
        </p>
      </div>
    </div>
  );
}
