import type { Metadata, Viewport } from "next";

import { site } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
import { PrefsScript } from "@/components/prefs/prefs-script";
import { PrefsSync } from "@/components/prefs/prefs-sync";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SkipLink } from "@/components/site/skip-link";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    locale: site.locale,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
};

// Approximations of the paper and ink backgrounds in globals.css.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1217" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <PrefsScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <SiteHeader />
        <main id="content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
        <PrefsSync />
        {/* interaction layer mounts here */}
      </body>
    </html>
  );
}
