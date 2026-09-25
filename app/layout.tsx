import type { Metadata, Viewport } from "next";

import { site } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
import { baseOpenGraph, titleTemplate, twitterCard } from "@/lib/metadata";
import { DraftModeTools } from "@/sanity/components/draft-mode-tools";
import { PrefsScript } from "@/components/prefs/prefs-script";
import { PrefsSync } from "@/components/prefs/prefs-sync";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: titleTemplate },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  openGraph: baseOpenGraph,
  twitter: { card: twitterCard },
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
    // `data-scroll-behavior` lets Next jump route changes to the top instantly
    // while the CSS smooth scroll (globals.css) still animates in-page anchors.
    <html
      lang="en"
      className={fontVariables}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <PrefsScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        {children}
        <PrefsSync />
        <DraftModeTools />
      </body>
    </html>
  );
}
