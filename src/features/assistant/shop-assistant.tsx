"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { useDialogA11y } from "@/hooks/use-dialog-a11y";
import { useStorefrontSettings } from "@/hooks/use-storefront-settings";
import { useAssistantStore } from "@/store/assistant-store";
import { externalLinkLabel } from "@/lib/a11y";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackAnalytics } from "@/lib/analytics-client";
import { whatsappShareUrl } from "@/lib/share";
import {
  getWhatsAppDefaultMessage,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";
import {
  DEFAULT_STOREFRONT_SETTINGS,
  type AssistantQuickReply,
} from "@/types/storefront-settings";

function getReply(
  input: string,
  rules: { keywords: string[]; answer: string }[]
): string {
  const q = input.toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.some((k) => q.includes(k.toLowerCase()))) {
      return rule.answer;
    }
  }
  return "I can help with orders, shipping, product info, and returns. Try a quick option below or use Chat with us.";
}

const floatingStackClass =
  "fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 max-lg:bottom-20";

export function ShopAssistant() {
  const router = useRouter();
  const { data: settings = DEFAULT_STOREFRONT_SETTINGS } =
    useStorefrontSettings();
  const open = useAssistantStore((s) => s.open);
  const prefill = useAssistantStore((s) => s.prefill);
  const setOpen = useAssistantStore((s) => s.setOpen);
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const appliedPrefill = useRef<string | null>(null);
  const wasOpen = useRef(false);
  const titleId = useId();
  const panelId = useId();
  const close = () => setOpen(false);

  useDialogA11y(open, close, panelRef);

  const assistant = settings.assistant;
  const whatsapp = normalizeWhatsAppNumber(settings.support.whatsappNumber);
  const waMessage = getWhatsAppDefaultMessage(settings.support);
  const showChat = assistant.enabled;
  const showFloatingWhatsApp =
    Boolean(whatsapp) && assistant.showFloatingWhatsApp;

  useEffect(() => {
    if (open && !wasOpen.current) {
      trackAnalytics({ type: AnalyticsEventType.ASSISTANT_OPEN });
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "bot", text: assistant.greeting }]);
    }
  }, [open, assistant.greeting, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open || !prefill || appliedPrefill.current === prefill) return;
    appliedPrefill.current = prefill;
    setInput(prefill);
  }, [open, prefill]);

  if (!showChat && !showFloatingWhatsApp) return null;

  function sendText(userText: string, viaQuickReply = false) {
    if (!userText.trim()) return;
    trackAnalytics({
      type: viaQuickReply
        ? AnalyticsEventType.ASSISTANT_QUICK_REPLY
        : AnalyticsEventType.ASSISTANT_MESSAGE,
      metadata: { length: userText.trim().length },
    });
    setMessages((m) => [...m, { role: "user", text: userText.trim() }]);
    setInput("");
    const reply = getReply(userText, assistant.faqRules);
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    }, 400);
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    sendText(input);
  }

  function toggle() {
    setOpen(!open);
    if (open) appliedPrefill.current = null;
  }

  function trackWhatsApp(source: string) {
    trackAnalytics({
      type: AnalyticsEventType.HELP_WHATSAPP,
      metadata: { source },
    });
  }

  function handleQuickReply(q: AssistantQuickReply) {
    if (q.action === "whatsapp") {
      trackAnalytics({
        type: AnalyticsEventType.ASSISTANT_QUICK_REPLY,
        metadata: { label: q.label, action: "whatsapp" },
      });
      if (whatsapp) {
        trackWhatsApp("assistant-quick-reply");
        window.open(
          whatsappShareUrl(whatsapp, waMessage),
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        router.push("/contact");
      }
      return;
    }

    if (q.action === "contact") {
      trackAnalytics({
        type: AnalyticsEventType.ASSISTANT_QUICK_REPLY,
        metadata: { label: q.label, action: "contact" },
      });
      router.push("/contact");
      return;
    }

    if (q.action === "track-order") {
      trackAnalytics({
        type: AnalyticsEventType.ASSISTANT_QUICK_REPLY,
        metadata: { label: q.label, action: "track-order" },
      });
      router.push("/track-order");
      return;
    }

    sendText(q.query, true);
  }

  return (
    <>
      <div className={floatingStackClass}>
        {showFloatingWhatsApp && whatsapp && (
          <a
            href={whatsappShareUrl(whatsapp, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsApp("floating")}
            aria-label={externalLinkLabel("Message BagnShop on WhatsApp")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="h-7 w-7" />
          </a>
        )}
        {showChat && (
          <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:bg-stone-100 dark:text-stone-900"
            aria-label={
              open
                ? `Close ${assistant.floatingChatLabel}`
                : `Open ${assistant.floatingChatLabel}`
            }
            aria-expanded={open}
            aria-controls={panelId}
          >
            {open ? (
              <X className="h-5 w-5 shrink-0" aria-hidden />
            ) : (
              <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
            )}
            <span className="text-sm font-medium">
              {open ? "Close" : assistant.floatingChatLabel}
            </span>
          </button>
        )}
      </div>
      {showChat && open && (
        <div
          id={panelId}
          ref={panelRef}
          className="fixed bottom-24 right-6 z-40 flex h-[min(28rem,70vh)] w-[min(100vw-3rem,360px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl max-lg:bottom-36"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 id={titleId} className="text-sm font-semibold">
              {assistant.title}
            </h2>
            <button
              type="button"
              onClick={close}
              className="rounded-full p-2 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
              aria-label={`Close ${assistant.title}`}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div
            className="flex-1 space-y-2 overflow-y-auto p-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Chat messages"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "bg-accent-muted text-foreground"
                }`}
                role={m.role === "user" ? undefined : "status"}
              >
                <span className="sr-only">
                  {m.role === "user" ? "You: " : "Assistant: "}
                </span>
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          {assistant.quickReplies.length > 0 && (
            <div
              role="group"
              aria-label="Suggested questions"
              className="flex flex-wrap gap-2 border-t border-border px-3 py-2"
            >
              {assistant.quickReplies.map((q: AssistantQuickReply) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleQuickReply(q)}
                  className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={send}
            className="flex gap-2 border-t border-border p-3"
            aria-label="Send a message"
          >
            <label htmlFor="assistant-message" className="sr-only">
              Your message
            </label>
            <input
              id="assistant-message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about orders, products, shipping…"
              className="h-10 flex-1 rounded-full border border-border px-4 text-sm focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
              autoComplete="off"
            />
            <Button type="submit" size="sm">
              Send
            </Button>
          </form>
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted">
            <Link
              href="/contact"
              className="underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
            >
              Contact us
            </Link>
            {whatsapp && assistant.showWhatsAppLink && (
              <a
                href={whatsappShareUrl(whatsapp, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsApp("assistant-panel")}
                aria-label={externalLinkLabel("Chat on WhatsApp")}
                className="inline-flex items-center gap-1 underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
