import { CheckoutForm } from "@/features/checkout/checkout-form";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="section-padding">
      <div className="container-page">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <div className="mt-12">
          <CheckoutForm />
        </div>
      </div>
    </div>
  );
}
