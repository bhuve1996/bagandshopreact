import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageSectionCopy } from "@/types/storefront-settings";
import { resolveBlogCoverImage } from "@/lib/blog-image";
import type { BlogPostSummary } from "@/services/blog";

type Props = {
  posts: BlogPostSummary[];
  section: HomepageSectionCopy;
};

function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogSection({ posts, section }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-page">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          linkText={section.linkText}
          linkHref={section.linkHref ?? "/blog"}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group card-premium flex flex-col overflow-hidden"
            >
              <div className="relative aspect-2/1 overflow-hidden bg-stone-100 dark:bg-stone-800">
                <Image
                  src={resolveBlogCoverImage(post.coverImage)}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <time
                  dateTime={post.publishedAt}
                  className="text-xs uppercase tracking-wide text-muted"
                >
                  {formatPostDate(post.publishedAt)}
                </time>
                <h3 className="mt-2 text-lg font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">
                  {post.excerpt}
                </p>
                <span className="mt-4 text-sm font-medium">Read article →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
