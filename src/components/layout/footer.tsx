"use client";

import Link from "next/link";
import { BrandLogoLink } from "@/components/layout/brand-logo";
import { FooterSocialLinks } from "@/components/layout/footer-social-links";
import { useStorefrontCopy } from "@/providers/storefront-copy-provider";

const footerLinks = {
  Shop: [
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Best Sellers", href: "/collections/best-sellers" },
    { label: "Bags", href: "/collections/bags" },
    { label: "Tech", href: "/collections/tech" },
  ],
  Support: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Track Order", href: "/track-order" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Perfect gifting", href: "/gifting" },
    { label: "Corporate gifting", href: "/corporate" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Return & Refund", href: "/returns" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

export function Footer() {
  const { brand } = useStorefrontCopy();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page section-padding">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandLogoLink height={36} />
            <p className="mt-3 max-w-sm text-sm text-muted">{brand.tagline}</p>
            <FooterSocialLinks />
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <nav key={title} aria-labelledby={`footer-${title}`}>
              <h3
                id={`footer-${title}`}
                className="text-xs font-semibold uppercase tracking-widest text-muted"
              >
                {title}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-muted"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <p>Made with care in India</p>
        </div>
      </div>
    </footer>
  );
}
