"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const REPLIES: Record<string, string> = {
  shipping:
    "We offer free shipping on orders above ₹999. Delivery usually takes 2–5 business days.",
  return:
    "You can return unused items within 15 days in original packaging.",
  track:
    "Use the Track Order page with your order number (starts with BS).",
  payment:
    "We accept COD, UPI, and Razorpay (cards & wallets).",
};

function getReply(input: string) {
  const q = input.toLowerCase();
  if (q.includes("ship")) return REPLIES.shipping;
  if (q.includes("return")) return REPLIES.return;
  if (q.includes("track")) return REPLIES.track;
  if (q.includes("pay") || q.includes("cod")) return REPLIES.payment;
  return "I can help with shipping, returns, tracking, and payments. Try asking about one of those, or browse our collections.";
}

export function ShopAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm your Bag & Shop assistant. How can I help?" },
  ]);
  const [input, setInput] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "bot", text: getReply(userText) },
      ]);
    }, 400);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg dark:bg-stone-100 dark:text-stone-900"
        aria-label="Shop assistant"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-96 w-[min(100vw-3rem,360px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">
            Shop assistant
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "bg-accent-muted text-foreground"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about shipping, returns…"
              className="h-10 flex-1 rounded-full border border-border px-4 text-sm"
            />
            <Button type="submit" size="sm">
              Send
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
