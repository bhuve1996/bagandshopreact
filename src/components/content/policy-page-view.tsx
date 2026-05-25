import { StaticPageLayout } from "@/components/content/static-page-layout";
import { policyBodyParagraphs } from "@/lib/policy-pages";
import type { PolicyPageContent } from "@/types/storefront-settings";

type Props = {
  page: PolicyPageContent;
};

export function PolicyPageView({ page }: Props) {
  const paragraphs = policyBodyParagraphs(page.body);

  return (
    <StaticPageLayout title={page.title}>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </StaticPageLayout>
  );
}
