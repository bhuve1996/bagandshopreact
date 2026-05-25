const faqs = [
  {
    q: "What is your return policy?",
    a: "15-day easy returns on unused items in original packaging.",
  },
  {
    q: "How long does shipping take?",
    a: "2–5 business days. Free shipping on orders above ₹999.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "COD, UPI, and Razorpay (cards, wallets, netbanking).",
  },
];

export const metadata = { title: "FAQ" };

export default function FAQPage() {
  return (
    <div className="section-padding">
      <div className="container-page max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
        <dl className="mt-10 space-y-8">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-2 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
