import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  adminGetStorefrontSettings,
  adminUpdateStorefrontSettings,
} from "@/services/storefront-settings";
import { mergeStorefrontSettings } from "@/types/storefront-settings";

const faqItemSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
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
  if (!merged.support.email.includes("@")) {
    throw new Error("Valid support email required");
  }
  return mergeStorefrontSettings({ ...merged, seo });
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  return NextResponse.json(await adminGetStorefrontSettings());
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
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
