"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

type StockNotifyFormProps = {
  productSlug: string;
};

export function StockNotifyForm({ productSlug }: StockNotifyFormProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email required", "Enter your email to get notified.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), productSlug }),
      });
      if (!res.ok) {
        toast.error("Could not subscribe", "Try again in a moment.");
        return;
      }
      toast.success("You're on the list", "We'll email you when this item is back.");
    } catch {
      toast.error("Could not subscribe", "Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-2 rounded-lg border border-border p-4">
      <p className="text-sm text-muted">Get an email when this item is back in stock.</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <Button type="submit" variant="outline" className="w-full" disabled={loading}>
        {loading ? "Saving…" : "Notify me"}
      </Button>
    </form>
  );
}
