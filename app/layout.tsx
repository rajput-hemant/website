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
  // Mirrors --color-ground in app/globals.css; a <meta> tag can't read a CSS variable.
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#eceee9",
    },
    { media: "(prefers-color-scheme: dark)", color: "#0e2542" },
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
