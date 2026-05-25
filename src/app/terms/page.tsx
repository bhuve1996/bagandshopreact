import { StaticPageLayout } from "@/components/content/static-page-layout";

export const metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <StaticPageLayout title="Terms of service">
      <p>
        By using Bag & Shop you agree to these terms. Product images and
        descriptions are for illustration; minor variations may occur.
      </p>
      <p>
        Prices are listed in INR and may change without notice. Orders are
        confirmed when payment is received or COD is accepted at dispatch.
      </p>
      <p>
        We reserve the right to cancel orders affected by stock or pricing
        errors. Liability is limited to the amount paid for the affected order.
      </p>
    </StaticPageLayout>
  );
}
