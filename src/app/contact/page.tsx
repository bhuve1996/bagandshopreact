export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="section-padding">
      <div className="container-page max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-4 text-muted">
          Email us at{" "}
          <a href="mailto:hello@bagandshop.com" className="underline">
            hello@bagandshop.com
          </a>
        </p>
        <p className="mt-2 text-sm text-muted">
          Mon–Sat, 10am–6pm IST. We typically reply within 24 hours.
        </p>
      </div>
    </div>
  );
}
