import type { PolicyPageSlug, PolicyPagesSettings } from "@/types/storefront-settings";

export const POLICY_SLUGS: PolicyPageSlug[] = [
  "privacy",
  "shipping",
  "returns",
  "terms",
];

export const POLICY_PATH_BY_SLUG: Record<PolicyPageSlug, string> = {
  privacy: "/privacy",
  shipping: "/shipping",
  returns: "/returns",
  terms: "/terms",
};

export function getPolicyPage(
  pages: PolicyPagesSettings,
  slug: PolicyPageSlug
) {
  return pages[slug];
}

/** Split body on blank lines into paragraphs for rendering. */
export function policyBodyParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
