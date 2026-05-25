"use client";

import {
  Copy,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useId, useState } from "react";
import { toast } from "@/lib/toast";
import {
  buildProductSharePayload,
  copyToClipboard,
  emailShareUrl,
  facebookShareUrl,
  twitterShareUrl,
  whatsappShareUrl,
} from "@/lib/share";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackAnalytics } from "@/lib/analytics-client";
import { useStorefrontSettings } from "@/hooks/use-storefront-settings";
import { cn } from "@/lib/utils";
import type { ShareChannel } from "@/types/storefront-settings";

type ProductShareProps = {
  productId: string;
  productName: string;
  productSlug: string;
  className?: string;
};

function ShareIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs transition-colors hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
    >
      <span aria-hidden>{children}</span>
      <span>{label}</span>
    </button>
  );
}

export function ProductShare({
  productId,
  productName,
  productSlug,
  className,
}: ProductShareProps) {
  const { data: settings } = useStorefrontSettings();
  const [sharing, setSharing] = useState(false);
  const legendId = useId();

  if (!settings?.share.enabled) return null;

  const channels = settings.share.channels;
  if (!channels.length) return null;

  const { url, text } = buildProductSharePayload({
    name: productName,
    slug: productSlug,
    messageTemplate: settings.share.productMessageTemplate,
  });
  const whatsapp = settings.support.whatsappNumber?.replace(/\D/g, "");

  function logShare(channel: ShareChannel) {
    trackAnalytics({
      type: AnalyticsEventType.PRODUCT_SHARE,
      productId,
      metadata: { channel, slug: productSlug },
    });
  }

  async function handleCopy() {
    const ok = await copyToClipboard(url);
    if (ok) {
      logShare("copy");
      toast.success("Link copied");
    } else toast.error("Could not copy link");
  }

  async function handleNative() {
    if (!navigator.share) {
      await handleCopy();
      return;
    }
    setSharing(true);
    try {
      await navigator.share({
        title: productName,
        text,
        url,
      });
      logShare("native");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Share cancelled or unavailable");
      }
    } finally {
      setSharing(false);
    }
  }

  const handlers: Partial<Record<ShareChannel, () => void>> = {
    copy: handleCopy,
    whatsapp: () => {
      if (!whatsapp) {
        toast.info("WhatsApp not configured", "Add a number in Admin → Storefront");
        return;
      }
      logShare("whatsapp");
      window.open(whatsappShareUrl(whatsapp, text), "_blank", "noopener,noreferrer");
    },
    email: () => {
      logShare("email");
      window.location.href = emailShareUrl(productName, text);
    },
    facebook: () => {
      logShare("facebook");
      window.open(facebookShareUrl(url), "_blank", "noopener,noreferrer");
    },
    twitter: () => {
      logShare("twitter");
      window.open(twitterShareUrl(text, url), "_blank", "noopener,noreferrer");
    },
    native: () => {
      void handleNative();
    },
  };

  const labels: Record<ShareChannel, string> = {
    copy: "Copy link",
    whatsapp: "WhatsApp",
    email: "Email",
    facebook: "Facebook",
    twitter: "X",
    native: "Share",
  };

  const icons: Record<ShareChannel, React.ReactNode> = {
    copy: <Copy className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4 text-emerald-600" />,
    email: <Mail className="h-4 w-4" />,
    facebook: (
      <span className="text-sm font-bold text-blue-600">f</span>
    ),
    twitter: <span className="text-sm font-bold">𝕏</span>,
    native: <Share2 className="h-4 w-4" />,
  };

  return (
    <fieldset className={cn("mt-8 border-0 p-0", className)}>
      <legend
        id={legendId}
        className="text-xs font-semibold uppercase tracking-widest text-muted"
      >
        Share this product
      </legend>
      <div
        role="group"
        aria-labelledby={legendId}
        className="mt-3 flex flex-wrap gap-2"
      >
        {channels.map((channel) => {
          const action = handlers[channel];
          if (!action) return null;
          return (
            <ShareIconButton
              key={channel}
              label={labels[channel]}
              onClick={() => {
                if (channel === "native" && sharing) return;
                void action();
              }}
            >
              {icons[channel]}
            </ShareIconButton>
          );
        })}
      </div>
    </fieldset>
  );
}
