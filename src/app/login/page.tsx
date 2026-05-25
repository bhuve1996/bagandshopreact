import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="section-padding">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
