import Link from "next/link";
import { StaticPageLayout } from "@/components/content/static-page-layout";
import { staticPageMetadata } from "@/lib/seo/config";

export async function generateMetadata() {
  return staticPageMetadata("/careers", {
    title: "Careers",
    description: "Join the BagnShop team — open roles and how to apply.",
  });
}

export default function CareersPage() {
  return (
    <StaticPageLayout title="Careers">
      <p>
        We are a small team building a premium accessories brand. Open roles
        will be posted here as we grow.
      </p>
      <p>
        Interested in design, operations, or customer experience? Reach out via
        our{" "}
        <Link href="/contact" className="text-foreground underline">
          contact page
        </Link>{" "}
        with your portfolio or CV.
      </p>
    </StaticPageLayout>
  );
}
