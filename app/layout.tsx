import type { Metadata, Viewport } from "next";

import "./globals.css";

import { site } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
import { titleTemplate } from "@/lib/metadata";
import { prefsScript } from "@/lib/prefs";

export const metadata: Metadata = {
  title: { default: site.name, template: titleTemplate },
  description: site.description,
  metadataBase: new URL(site.url),
};

export const viewport: Viewport = {
  // Mirrors --color-ink in app/globals.css; a <meta> tag can't read a CSS variable.
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "oklch(0.975 0.008 85)",
    },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.16 0.012 262)" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The pre-paint script below mutates <html> attributes/style before hydration.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
