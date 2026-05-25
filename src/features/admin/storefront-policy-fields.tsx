"use client";

import {
  POLICY_PATH_BY_SLUG,
  POLICY_SLUGS,
} from "@/lib/policy-pages";
import type {
  PolicyPageSlug,
  StorefrontSettings,
} from "@/types/storefront-settings";

type Props = {
  settings: StorefrontSettings;
  onPatch: (
    section: "policyPages",
    value: Partial<StorefrontSettings["policyPages"]>
  ) => void;
};

const SLUG_LABELS: Record<PolicyPageSlug, string> = {
  privacy: "Privacy Policy",
  shipping: "Shipping Policy",
  returns: "Return & Refund Policy",
  terms: "Terms & Conditions",
};

export function StorefrontPolicyFields({ settings, onPatch }: Props) {
  function patchSlug(slug: PolicyPageSlug, field: "title" | "description" | "body", value: string) {
    onPatch("policyPages", {
      [slug]: { ...settings.policyPages[slug], [field]: value },
    });
  }

  return (
    <section className="card-premium space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Policy pages</h2>
        <p className="mt-1 text-sm text-muted">
          Legal and policy content shown at /privacy, /shipping, /returns, and
          /terms. Separate paragraphs with a blank line.
        </p>
      </div>

      {POLICY_SLUGS.map((slug) => {
        const page = settings.policyPages[slug];
        return (
          <div
            key={slug}
            className="space-y-3 rounded-xl border border-border p-4"
          >
            <p className="text-sm font-medium">
              {SLUG_LABELS[slug]}{" "}
              <span className="font-normal text-muted">
                ({POLICY_PATH_BY_SLUG[slug]})
              </span>
            </p>
            <label className="block text-sm">
              <span className="font-medium">Page title</span>
              <input
                required
                value={page.title}
                onChange={(e) => patchSlug(slug, "title", e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">SEO description</span>
              <input
                required
                value={page.description}
                onChange={(e) => patchSlug(slug, "description", e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Body (blank line between paragraphs)</span>
              <textarea
                required
                value={page.body}
                onChange={(e) => patchSlug(slug, "body", e.target.value)}
                rows={8}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
              />
            </label>
          </div>
        );
      })}
    </section>
  );
}
