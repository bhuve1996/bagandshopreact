"use client";

import {
  activeSocialLinks,
  SOCIAL_PLATFORM_LABELS,
  SocialPlatformIcon,
} from "@/lib/social-platforms";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";
import { cn } from "@/lib/utils";

type FooterSocialLinksProps = {
  className?: string;
};

export function FooterSocialLinks({ className }: FooterSocialLinksProps) {
  const { social } = useStorefrontCopy();
  const links = activeSocialLinks(social.links);

  if (!links.length) return null;

  return (
    <nav aria-label="Social media" className={cn("mt-5", className)}>
      <ul className="flex flex-wrap gap-3">
        {links.map((link) => (
          <li key={link.platform}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:hover:bg-stone-800"
              aria-label={SOCIAL_PLATFORM_LABELS[link.platform]}
            >
              <SocialPlatformIcon platform={link.platform} className="h-4 w-4" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
