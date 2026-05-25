import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteShellWrapper } from "@/components/layout/site-shell-wrapper";
import { AppProviders } from "@/providers/app-providers";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { brandAssets } from "@/lib/site-content";
import { buildRootMetadata } from "@/lib/seo/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const root = await buildRootMetadata();
  return {
    ...root,
    icons: {
      icon: [
        { url: brandAssets.icons.icon16, sizes: "16x16", type: "image/png" },
        { url: brandAssets.icons.icon32, sizes: "32x32", type: "image/png" },
        { url: brandAssets.icons.icon256, sizes: "256x256", type: "image/png" },
      ],
      apple: brandAssets.icons.apple,
      other: [
        {
          rel: "android-chrome-192x192",
          url: brandAssets.icons.android192,
        },
        {
          rel: "android-chrome-512x512",
          url: brandAssets.icons.android512,
        },
      ],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <SiteJsonLd />
        <AppProviders>
          <SiteShellWrapper>{children}</SiteShellWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
