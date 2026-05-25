"use client";

import {
  DEFAULT_SEO,
  type StorefrontSettings,
} from "@/types/storefront-settings";

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

type Props = {
  settings: StorefrontSettings;
  onPatch: <K extends keyof StorefrontSettings>(
    section: K,
    value: Partial<StorefrontSettings[K]>
  ) => void;
};

export function StorefrontSeoFields({ settings, onPatch }: Props) {
  const seo = settings.seo ?? DEFAULT_SEO;

  return (
    <section className="card-premium space-y-4 p-6">
      <h2 className="text-lg font-semibold">SEO &amp; meta tags</h2>
      <p className="text-sm text-muted">
        Site-wide defaults, Open Graph, Google verification, FAQ schema, and
        per-page title/description overrides.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Homepage title">
          <input
            required
            value={seo.homeTitle}
            onChange={(e) => onPatch("seo", { homeTitle: e.target.value })}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm sm:col-span-2"
          />
        </Field>
        <Field label="Default meta description">
          <textarea
            required
            value={seo.defaultDescription}
            onChange={(e) =>
              onPatch("seo", { defaultDescription: e.target.value })
            }
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
          />
        </Field>
        <Field label="Default OG / social image (path or URL)">
          <input
            required
            value={seo.defaultOgImage}
            onChange={(e) => onPatch("seo", { defaultOgImage: e.target.value })}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm sm:col-span-2"
          />
        </Field>
        <Field label="Organization logo (JSON-LD)">
          <input
            value={seo.organizationLogo}
            onChange={(e) =>
              onPatch("seo", { organizationLogo: e.target.value })
            }
            className="h-10 w-full rounded-lg border border-border px-3 text-sm sm:col-span-2"
          />
        </Field>
        <Field label="OG locale">
          <input
            value={seo.ogLocale}
            onChange={(e) => onPatch("seo", { ogLocale: e.target.value })}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
        </Field>
        <Field label="Twitter @handle (optional)">
          <input
            value={seo.twitterHandle ?? ""}
            onChange={(e) => onPatch("seo", { twitterHandle: e.target.value })}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
        </Field>
        <Field label="Google Search Console verification">
          <input
            value={seo.googleSiteVerification ?? ""}
            onChange={(e) =>
              onPatch("seo", { googleSiteVerification: e.target.value })
            }
            className="h-10 w-full rounded-lg border border-border px-3 text-sm sm:col-span-2"
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={seo.allowIndexing}
          onChange={(e) => onPatch("seo", { allowIndexing: e.target.checked })}
        />
        Allow search engines to index the storefront
      </label>
      <Field label="FAQ page title (meta)">
        <input
          value={seo.faqMetaTitle}
          onChange={(e) => onPatch("seo", { faqMetaTitle: e.target.value })}
          className="h-10 w-full rounded-lg border border-border px-3 text-sm"
        />
      </Field>
      <Field label="FAQ page description (meta)">
        <textarea
          value={seo.faqMetaDescription}
          onChange={(e) =>
            onPatch("seo", { faqMetaDescription: e.target.value })
          }
          rows={2}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </Field>
      <Field label="FAQ items (question | answer — /faq + JSON-LD)">
        <textarea
          value={seo.faqItems.map((f) => `${f.q}|${f.a}`).join("\n")}
          onChange={(e) => {
            const faqItems = e.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [q, ...rest] = line.split("|");
                return { q: q.trim(), a: rest.join("|").trim() };
              })
              .filter((f) => f.q && f.a);
            onPatch("seo", { faqItems });
          }}
          rows={6}
          className="w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
        />
      </Field>
      <Field label="Page overrides (path | title | description)">
        <textarea
          value={seo.pageOverrides
            .map((p) => `${p.path}|${p.title}|${p.description}`)
            .join("\n")}
          onChange={(e) => {
            const pageOverrides = e.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [path, title, ...desc] = line.split("|");
                return {
                  path: path.trim(),
                  title: title.trim(),
                  description: desc.join("|").trim(),
                };
              })
              .filter(
                (p) => p.path.startsWith("/") && p.title && p.description
              );
            onPatch("seo", { pageOverrides });
          }}
          rows={6}
          className="w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
        />
      </Field>
    </section>
  );
}
