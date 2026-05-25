import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ReferralPanel } from "@/features/account/referral-panel";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account");

  return (
    <div className="section-padding">
      <div className="container-page max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
        <div className="card-premium mt-8 space-y-4 p-6">
          <p>
            <span className="text-muted">Name:</span> {session.user.name}
          </p>
          <p>
            <span className="text-muted">Email:</span> {session.user.email}
          </p>
          <p>
            <span className="text-muted">Role:</span> {session.user.role}
          </p>
        </div>
        <ReferralPanel />
        <nav className="mt-8 flex flex-col gap-2 text-sm">
          <Link href="/orders" className="underline-offset-4 hover:underline">
            Order history
          </Link>
          <Link href="/wishlist" className="underline-offset-4 hover:underline">
            Wishlist
          </Link>
          <Link href="/track-order" className="underline-offset-4 hover:underline">
            Track order
          </Link>
        </nav>
      </div>
    </div>
  );
}
