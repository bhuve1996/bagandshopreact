"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { CorporateBundle } from "@/types/corporate";

type Props = {
  bundles: CorporateBundle[];
  supportEmail: string;
};

export function CorporateInquiryForm({ bundles, supportEmail }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    bundleId: "",
    quantity: "",
    message: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/corporate/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone || undefined,
          bundleId: form.bundleId || undefined,
          quantity: form.quantity ? Number(form.quantity) : undefined,
          message: form.message || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error("Could not send", json.error ?? "Please try again.");
        return;
      }
      toast.success(
        "Request received",
        "Our team will reach out within 1–2 business days."
      );
      setForm({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        bundleId: "",
        quantity: "",
        message: "",
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm";

  return (
    <form onSubmit={onSubmit} className="card-premium space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Company name</span>
          <input
            required
            value={form.companyName}
            onChange={(e) =>
              setForm((f) => ({ ...f, companyName: e.target.value }))
            }
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Your name</span>
          <input
            required
            value={form.contactName}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactName: e.target.value }))
            }
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Work email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Phone (optional)</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Sample bundle (optional)</span>
          <select
            value={form.bundleId}
            onChange={(e) =>
              setForm((f) => ({ ...f, bundleId: e.target.value }))
            }
            className={`mt-1 ${inputClass}`}
          >
            <option value="">Custom mix / not sure yet</option>
            {bundles.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Estimated quantity</span>
          <input
            type="number"
            min={1}
            placeholder="e.g. 50"
            value={form.quantity}
            onChange={(e) =>
              setForm((f) => ({ ...f, quantity: e.target.value }))
            }
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Tell us about your project</span>
          <textarea
            rows={4}
            placeholder="Occasion, branding needs, delivery timeline, budget range…"
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Sending…" : "Submit inquiry"}
      </Button>
      <p className="text-xs text-muted">
        Or email us directly at{" "}
        <a href={`mailto:${supportEmail}`} className="underline">
          {supportEmail}
        </a>
        .
      </p>
    </form>
  );
}
