import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  adminGetStorefrontSettings,
  adminUpdateStorefrontSettings,
} from "@/services/storefront-settings";
import { SOCIAL_PLATFORM_LABELS } from "@/lib/social-platforms";
import { mergeStorefrontSettings } from "@/types/storefront-settings";

const faqItemSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

const policyPageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  body: z.string().min(1),
});

const policyPagesSchema = z.object({
  privacy: policyPageSchema,
  shipping: policyPageSchema,
  returns: policyPageSchema,
  terms: policyPageSchema,
});

const seoSchema = z.object({
  homeTitle: z.string().min(1),
  defaultDescription: z.string().min(1),
  defaultOgImage: z.string().min(1),
  ogLocale: z.string().min(2),
  twitterHandle: z.string().optional(),
  googleSiteVerification: z.string().optional(),
  allowIndexing: z.boolean(),
  organizationLogo: z.string().min(1),
  faqMetaTitle: z.string().min(1),
  faqMetaDescription: z.string().min(1),
  faqItems: z.array(faqItemSchema).min(1),
  pageOverrides: z.array(
    z.object({
      path: z.string().startsWith("/"),
      title: z.string().min(1),
      description: z.string().min(1),
      noIndex: z.boolean().optional(),
    })
  ),
});

/** Validates admin payload; merges with defaults so partial legacy saves stay safe. */
function validateStorefrontPayload(body: unknown) {
  const merged = mergeStorefrontSettings(
    body as Parameters<typeof mergeStorefrontSettings>[0]
  );
  const seo = seoSchema.parse(merged.seo);
  policyPagesSchema.parse(merged.policyPages);
  if (!merged.support.email.includes("@")) {
    throw new Error("Valid support email required");
  }
  for (const link of merged.social.links) {
    const label = SOCIAL_PLATFORM_LABELS[link.platform];
    const url = link.url.trim();
    if (link.enabled && !url) {
      throw new Error(`${label}: URL required when enabled`);
    }
    if (!url) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("invalid protocol");
      }
    } catch {
      throw new Error(`${label}: enter a valid http(s) URL`);
    }
  }
  return mergeStorefrontSettings({ ...merged, seo });
}

export async function GET() {
  const auth = await requireAdmin("settings");
  if (auth.error) return auth.error;
  return NextResponse.json(await adminGetStorefrontSettings());
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin("settings");
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    const saved = await adminUpdateStorefrontSettings(
      validateStorefrontPayload(body)
    );
    return NextResponse.json(saved);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to save settings";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
