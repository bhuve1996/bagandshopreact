"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "@/lib/toast";

type SignOutButtonProps = {
  callbackUrl?: string;
  onSignedOut?: () => void;
} & Pick<ButtonProps, "variant" | "size" | "className">;

export function SignOutButton({
  callbackUrl = "/",
  onSignedOut,
  variant = "outline",
  size = "default",
  className,
}: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut({ redirect: false, callbackUrl });
      onSignedOut?.();
      toast.success("Signed out");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Sign out failed", "Please try again.");
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={loading}
      onClick={handleSignOut}
    >
      {loading ? "Signing out…" : "Sign out"}
    </Button>
  );
}
