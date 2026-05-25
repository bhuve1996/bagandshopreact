"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDialogA11y } from "@/hooks/use-dialog-a11y";
import { useStorefrontSettings } from "@/hooks/use-storefront-settings";
import { useAssistantStore } from "@/store/assistant-store";
import { externalLinkLabel } from "@/lib/a11y";
import { whatsappShareUrl } from "@/lib/share";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackAnalytics } from "@/lib/analytics-client";
import { DEFAULT_STOREFRONT_SETTINGS } from "@/types/storefront-settings";

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
  return "I can help with shipping, returns, tracking, and payments. Try a quick reply below or contact our team.";
}

export function ShopAssistant() {
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
  const whatsapp = settings.support.whatsappNumber?.replace(/\D/g, "");

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

  if (!assistant.enabled) return null;

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

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 max-lg:bottom-20 dark:bg-stone-100 dark:text-stone-900"
        aria-label={open ? `Close ${assistant.title}` : `Open ${assistant.title}`}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden />
        ) : (
          <MessageCircle className="h-5 w-5" aria-hidden />
        )}
      </button>
      {open && (
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
              {assistant.quickReplies.map((q: { label: string; query: string }) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => sendText(q.query, true)}
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
              placeholder="Ask about shipping, returns…"
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
                href={whatsappShareUrl(whatsapp, "Hi, I need help with my order.")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={externalLinkLabel("Chat on WhatsApp")}
                className="underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
