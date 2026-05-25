import { StaticPageLayout } from "@/components/content/static-page-layout";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <StaticPageLayout title="Privacy policy">
      <p>
        Bag & Shop respects your privacy. We collect information you provide at
        checkout and when you create an account (name, email, shipping address,
        order history).
      </p>
      <p>
        We use this data to fulfill orders, send transactional emails, and
        improve our store. We do not sell your personal information to third
        parties.
      </p>
      <p>
        Payment processing is handled by secure partners (e.g. Razorpay). Cookies
        may be used for cart persistence and analytics.
      </p>
      <p>
        Questions? Contact us via the{" "}
        <a href="/contact" className="text-foreground underline">
          contact page
        </a>
        .
      </p>
    </StaticPageLayout>
  );
}
