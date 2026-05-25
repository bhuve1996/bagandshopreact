"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import {
  StorefrontBrandFields,
  StorefrontHomepageFields,
  StorefrontLabelsFields,
} from "@/features/admin/storefront-copy-fields";
import { StorefrontSeoFields } from "@/features/admin/storefront-seo-fields";
import type { ShareChannel, StorefrontSettings } from "@/types/storefront-settings";

const SHARE_OPTIONS: { id: ShareChannel; label: string }[] = [
  { id: "copy", label: "Copy link" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "X (Twitter)" },
  { id: "native", label: "Native share (mobile)" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function StorefrontSettingsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-storefront-settings"],
    queryFn: () =>
      fetch("/api/admin/settings").then(
        (r) => r.json() as Promise<StorefrontSettings>
      ),
  });
  const [form, setForm] = useState<StorefrontSettings | null>(null);
  const [saving, setSaving] = useState(false);

  const settings = form ?? data;

  function patch<K extends keyof StorefrontSettings>(
    section: K,
    value: Partial<StorefrontSettings[K]>
  ) {
    if (!settings) return;
    setForm({
      ...settings,
      [section]: { ...settings[section], ...value },
    });
  }

  function toggleChannel(channel: ShareChannel) {
    if (!settings) return;
    const channels = settings.share.channels.includes(channel)
      ? settings.share.channels.filter((c) => c !== channel)
      : [...settings.share.channels, channel];
    patch("share", { channels });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Save failed");
      }
      toast.success("Storefront settings saved");
      qc.invalidateQueries({ queryKey: ["admin-storefront-settings"] });
      qc.invalidateQueries({ queryKey: ["storefront-settings"] });
      setForm(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !settings) {
    return <p className="text-muted">Loading settings…</p>;
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Content &amp; labels</h1>
        <p className="mt-1 text-sm text-muted">
          Brand, SEO meta, homepage copy, labels, support, sharing, and assistant.
        </p>
      </div>

      <StorefrontSeoFields settings={settings} onPatch={patch} />
      <StorefrontBrandFields settings={settings} onPatch={patch} />
      <StorefrontHomepageFields settings={settings} onPatch={patch} />
      <StorefrontLabelsFields settings={settings} onPatch={patch} />

      <section className="card-premium space-y-4 p-6">
        <h2 className="text-lg font-semibold">Support & WhatsApp</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Support email">
            <input
              type="email"
              required
              value={settings.support.email}
              onChange={(e) => patch("support", { email: e.target.value })}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </Field>
          <Field label="Phone (optional)">
            <input
              value={settings.support.phone ?? ""}
              onChange={(e) => patch("support", { phone: e.target.value })}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm"
            />
          </Field>
          <Field label="WhatsApp number (country code, digits only)">
            <input
              placeholder="919876543210"
              value={settings.support.whatsappNumber ?? ""}
              onChange={(e) =>
                patch("support", { whatsappNumber: e.target.value })
              }
              className="h-10 w-full rounded-lg border border-border px-3 text-sm sm:col-span-2"
            />
          </Field>
          <Field label="Support hours / reply time">
            <textarea
              value={settings.support.hours ?? ""}
              onChange={(e) => patch("support", { hours: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
            />
          </Field>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6">
        <h2 className="text-lg font-semibold">Product sharing (PDP)</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.share.enabled}
            onChange={(e) => patch("share", { enabled: e.target.checked })}
          />
          Enable share section on product pages
        </label>
        <Field label="Share message template ({{name}}, {{url}}, {{site}})">
          <input
            value={settings.share.productMessageTemplate}
            onChange={(e) =>
              patch("share", { productMessageTemplate: e.target.value })
            }
            className="h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
        </Field>
        <p className="text-sm font-medium">Channels</p>
        <div className="flex flex-wrap gap-3">
          {SHARE_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.share.channels.includes(opt.id)}
                onChange={() => toggleChannel(opt.id)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      <section className="card-premium space-y-4 p-6">
        <h2 className="text-lg font-semibold">Shop assistant</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.assistant.enabled}
            onChange={(e) => patch("assistant", { enabled: e.target.checked })}
          />
          Show floating assistant
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.assistant.showWhatsAppLink}
            onChange={(e) =>
              patch("assistant", { showWhatsAppLink: e.target.checked })
            }
          />
          Show WhatsApp link in assistant & PDP help
        </label>
        <Field label="Assistant title">
          <input
            value={settings.assistant.title}
            onChange={(e) => patch("assistant", { title: e.target.value })}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
        </Field>
        <Field label="Greeting message">
          <textarea
            value={settings.assistant.greeting}
            onChange={(e) => patch("assistant", { greeting: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Quick replies (label | query, one per line)">
          <textarea
            value={settings.assistant.quickReplies
              .map((q) => `${q.label}|${q.query}`)
              .join("\n")}
            onChange={(e) => {
              const quickReplies = e.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                  const [label, ...rest] = line.split("|");
                  return {
                    label: label.trim(),
                    query: (rest.join("|") || label).trim(),
                  };
                });
              patch("assistant", { quickReplies });
            }}
            rows={5}
            className="w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
          />
        </Field>
        <Field label="FAQ rules (keywords comma-separated | answer, one per line)">
          <textarea
            value={settings.assistant.faqRules
              .map((r) => `${r.keywords.join(", ")}|${r.answer}`)
              .join("\n")}
            onChange={(e) => {
              const faqRules = e.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                  const [kw, ...ans] = line.split("|");
                  return {
                    keywords: kw.split(",").map((k) => k.trim()).filter(Boolean),
                    answer: ans.join("|").trim(),
                  };
                })
                .filter((r) => r.keywords.length > 0 && r.answer);
              patch("assistant", { faqRules });
            }}
            rows={8}
            className="w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
          />
        </Field>
      </section>

      <section className="card-premium space-y-4 p-6">
        <h2 className="text-lg font-semibold">Delivery (PDP)</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.delivery.showOnPdp}
            onChange={(e) => patch("delivery", { showOnPdp: e.target.checked })}
          />
          Show delivery estimate on product pages
        </label>
        <Field label="Estimate text">
          <input
            value={settings.delivery.estimateText}
            onChange={(e) =>
              patch("delivery", { estimateText: e.target.value })
            }
            className="h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
        </Field>
      </section>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save storefront settings"}
      </Button>
    </form>
  );
}
