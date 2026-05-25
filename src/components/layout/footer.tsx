import Link from "next/link";
import { BrandLogoLink } from "@/components/layout/brand-logo";
import { siteConfig } from "@/lib/site-content";

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
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page section-padding">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandLogoLink height={36} />
            <p className="mt-3 max-w-sm text-sm text-muted">
              {siteConfig.tagline}. Premium accessories designed for modern
              life — minimal, functional, and beautifully made.
            </p>
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
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Made with care in India</p>
        </div>
      </div>
    </footer>
  );
}
