import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDeleteBlogPost, adminUpdateBlogPost } from "@/services/admin";

type Props = { params: Promise<{ id: string }> };

const blogPatchSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  published: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: Props) {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    const body = blogPatchSchema.parse(await request.json());
    const post = await adminUpdateBlogPost(id, body);
    return NextResponse.json(post);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    await adminDeleteBlogPost(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
