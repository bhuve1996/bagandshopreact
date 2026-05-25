import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { adminCreateBlogPost, adminListBlogPosts } from "@/services/admin";

const blogBodySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImage: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;
  return NextResponse.json(await adminListBlogPosts());
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;
  try {
    const body = blogBodySchema.parse(await request.json());
    const post = await adminCreateBlogPost(body);
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
