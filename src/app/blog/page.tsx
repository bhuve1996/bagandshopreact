import Link from "next/link";
import { StaticPageLayout } from "@/components/content/static-page-layout";
import { staticPageMetadata } from "@/lib/seo/config";

export async function generateMetadata() {
  return staticPageMetadata("/blog", {
    title: "Blog",
    description: "Design, carry, and workspace stories from Bag & Shop.",
  });
}

const posts = [
  {
    title: "Desk setup essentials for 2026",
    href: "/collections/desk",
    excerpt: "Organizers, mouse pads, and minimal workspace upgrades.",
  },
  {
    title: "How to choose the right phone case",
    href: "/collections/tech",
    excerpt: "Fit, protection, and finishes that last.",
  },
  {
    title: "Travel light with smart packing",
    href: "/collections/travel",
    excerpt: "Pouches and organizers for every trip.",
  },
];

export default function BlogPage() {
  return (
    <StaticPageLayout title="Blog">
      <p>Stories on design, carry, and workspace — shop the collections below.</p>
      <ul className="mt-8 space-y-8">
        {posts.map((post) => (
          <li key={post.title}>
            <Link
              href={post.href}
              className="text-base font-medium text-foreground underline-offset-4 hover:underline"
            >
              {post.title}
            </Link>
            <p className="mt-2">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </StaticPageLayout>
  );
}
