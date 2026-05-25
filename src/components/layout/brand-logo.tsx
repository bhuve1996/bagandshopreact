"use client";

import Image from "next/image";
import Link from "next/link";
import { brandAssets } from "@/lib/site-content";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Rendered logo height in px (width follows 3:1 aspect). */
  height?: number;
  priority?: boolean;
};

export function BrandLogo({ className, height = 32, priority }: BrandLogoProps) {
  const { brand } = useStorefrontCopy();
  const width = Math.round((height * brandAssets.logoWidth) / brandAssets.logoHeight);

  return (
    <Image
      src={brandAssets.logo}
      alt={brand.name}
      width={width}
      height={height}
      className={cn("w-auto object-contain", className)}
      style={{ height, width: "auto", maxWidth: width }}
      priority={priority}
    />
  );
}

type BrandLogoLinkProps = BrandLogoProps & {
  href?: string;
};

export function BrandLogoLink({
  className,
  height = 32,
  priority,
  href = "/",
}: BrandLogoLinkProps) {
  const { brand } = useStorefrontCopy();

  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0", className)}
      aria-label={`${brand.name} home`}
    >
      <BrandLogo height={height} priority={priority} />
    </Link>
  );
}
