import Image from "next/image";
import Link from "next/link";
import { StaticPageLayout } from "@/components/content/static-page-layout";
import { staticPageMetadata } from "@/lib/seo/config";
import { resolveBlogCoverImage } from "@/lib/blog-image";
import { listPublishedBlogPosts } from "@/services/blog";

export async function generateMetadata() {
  return staticPageMetadata("/blog", {
    title: "Blog",
    description: "Design, carry, and workspace stories from BagnShop.",
  });
}

function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await listPublishedBlogPosts();

  return (
    <StaticPageLayout title="Blog">
      <p>Stories on design, carry, and workspace.</p>
      {posts.length === 0 ? (
        <p className="mt-8 text-sm">New articles coming soon.</p>
      ) : (
        <ul className="mt-8 space-y-10">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-border pb-10 last:border-0">
              <article>
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative mb-4 block aspect-2/1 max-h-56 overflow-hidden rounded-xl bg-stone-100"
                >
                  <Image
                    src={resolveBlogCoverImage(post.coverImage)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 672px) 100vw, 672px"
                  />
                </Link>
                <time
                  dateTime={post.publishedAt}
                  className="text-xs uppercase tracking-wide text-muted"
                >
                  {formatPostDate(post.publishedAt)}
                  {post.author ? ` · ${post.author}` : null}
                </time>
                <h2 className="mt-2 text-lg font-medium">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline"
                >
                  Read more
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </StaticPageLayout>
  );
}
