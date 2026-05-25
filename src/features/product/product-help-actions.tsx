"use client";

import Link from "next/link";
import { useId } from "react";
import { HelpCircle, MessagesSquare } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { useStorefrontSettings } from "@/hooks/use-storefront-settings";
import { buildProductSharePayload, whatsappShareUrl } from "@/lib/share";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { externalLinkLabel } from "@/lib/a11y";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackAnalytics } from "@/lib/analytics-client";
import { useAssistantStore } from "@/store/assistant-store";
import { cn } from "@/lib/utils";

type ProductHelpActionsProps = {
  productId: string;
  productName: string;
  productSlug: string;
  className?: string;
};

const actionClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800";

export function ProductHelpActions({
  productId,
  productName,
  productSlug,
  className,
}: ProductHelpActionsProps) {
  const { data: settings } = useStorefrontSettings();
  const openAssistant = useAssistantStore((s) => s.openWithMessage);
  const headingId = useId();

  if (!settings) return null;

  const whatsapp = normalizeWhatsAppNumber(settings.support.whatsappNumber);
  const askMessage = `Hi, I have a question about "${productName}".`;
  const productInfoMessage = `Hi, I'd like product info (materials, size, specs) for "${productName}".`;

  function openWhatsApp() {
    if (!whatsapp) return;
    trackAnalytics({
      type: AnalyticsEventType.HELP_WHATSAPP,
      productId,
      metadata: { slug: productSlug, source: "pdp" },
    });
    const { text } = buildProductSharePayload({
      name: productName,
      slug: productSlug,
      messageTemplate: `Hi, I'd like help with {{name}}: {{url}}`,
    });
    window.open(
      whatsappShareUrl(whatsapp, text),
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "mt-6 rounded-2xl border border-border bg-accent-muted/40 p-4",
        className
      )}
    >
      <h2
        id={headingId}
        className="text-xs font-semibold uppercase tracking-widest text-muted"
      >
        Need help?
      </h2>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {settings.assistant.enabled && (
          <>
            <button
              type="button"
              onClick={() => {
                trackAnalytics({
                  type: AnalyticsEventType.HELP_ASK_PRODUCT,
                  productId,
                  metadata: { slug: productSlug },
                });
                openAssistant(askMessage);
              }}
              className={actionClass}
            >
              <MessagesSquare className="h-4 w-4 shrink-0" aria-hidden />
              Ask about this product
            </button>
            <button
              type="button"
              onClick={() => {
                trackAnalytics({
                  type: AnalyticsEventType.HELP_ASK_PRODUCT,
                  productId,
                  metadata: { slug: productSlug, intent: "product-info" },
                });
                openAssistant(productInfoMessage);
              }}
              className={actionClass}
            >
              <HelpCircle className="h-4 w-4 shrink-0" aria-hidden />
              Product info
            </button>
          </>
        )}
        {whatsapp && settings.assistant.showWhatsAppLink && (
          <button
            type="button"
            onClick={openWhatsApp}
            className={actionClass}
            aria-label={externalLinkLabel("Chat on WhatsApp")}
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
            Chat on WhatsApp
          </button>
        )}
        <Link href="/contact" className={actionClass}>
          <HelpCircle className="h-4 w-4 shrink-0" aria-hidden />
          Contact us
        </Link>
      </div>
      {settings.support.hours && (
        <p className="mt-3 text-xs text-muted">{settings.support.hours}</p>
      )}
    </section>
  );
}
