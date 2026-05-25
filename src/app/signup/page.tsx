import { SignupForm } from "@/features/auth/signup-form";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="section-padding">
      <SignupForm />
    </div>
  );
}
