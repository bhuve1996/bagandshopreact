import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BlogContent } from "@/lib/blog-content";
import { pageMetadata } from "@/lib/seo/metadata-helpers";
import { getSeoSettings } from "@/lib/seo/config";
import { getPublishedBlogPostBySlug } from "@/services/blog";

type Props = { params: Promise<{ slug: string }> };

function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, seo] = await Promise.all([
    getPublishedBlogPostBySlug(slug),
    getSeoSettings(),
  ]);
  if (!post) return { title: "Post not found" };

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const image = post.ogImage || post.coverImage || seo.defaultOgImage;

  return pageMetadata({
    title,
    description,
    path: `/blog/${post.slug}`,
    image,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="section-padding">
      <div className="container-page max-w-2xl">
        <Link
          href="/blog"
          className="text-sm text-muted underline-offset-4 hover:underline"
        >
          ← Blog
        </Link>
        <header className="mt-6">
          <time
            dateTime={post.publishedAt}
            className="text-xs uppercase tracking-wide text-muted"
          >
            {formatPostDate(post.publishedAt)}
            {post.author ? ` · ${post.author}` : null}
          </time>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-muted leading-relaxed">{post.excerpt}</p>
        </header>
        {post.coverImage ? (
          <div className="relative mt-8 aspect-2/1 overflow-hidden rounded-xl bg-stone-100">
            <Image
              src={post.coverImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
              priority
            />
          </div>
        ) : null}
        <div className="prose prose-stone mt-8 max-w-none text-sm text-muted">
          <BlogContent content={post.content} />
        </div>
      </div>
    </div>
  );
}
