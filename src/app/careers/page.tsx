import Link from "next/link";
import { StaticPageLayout } from "@/components/content/static-page-layout";

export const metadata = { title: "Careers" };

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
