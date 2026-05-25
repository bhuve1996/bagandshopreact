import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: string;
  author?: string;
};

export type BlogPostDetail = BlogPostSummary & {
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
};

function mapSummary(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: Date | null;
  author: string | null;
}): BlogPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage ?? undefined,
    publishedAt: (row.publishedAt ?? new Date()).toISOString(),
    author: row.author ?? undefined,
  };
}

export async function listPublishedBlogPosts(
  limit?: number
): Promise<BlogPostSummary[]> {
  if (!(await isDatabaseReady())) return [];
  const rows = await getPrisma().blogPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: true,
    },
  });
  return rows.map(mapSummary);
}

export async function getPublishedBlogPostBySlug(
  slug: string
): Promise<BlogPostDetail | null> {
  if (!(await isDatabaseReady())) return null;
  const row = await getPrisma().blogPost.findFirst({
    where: { slug, published: true },
  });
  if (!row) return null;
  return {
    ...mapSummary(row),
    content: row.content,
    metaTitle: row.metaTitle ?? undefined,
    metaDescription: row.metaDescription ?? undefined,
    ogImage: row.ogImage ?? undefined,
  };
}

export async function getAllBlogSitemapEntries(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
}
