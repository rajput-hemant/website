import type { Metadata, Viewport } from "next";

import "@/flavors/picker/styles.css";

import { fontVariables } from "@/flavors/picker/fonts";

import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
};

// Mirrors --color-canvas in styles.css.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f8" },
    { media: "(prefers-color-scheme: dark)", color: "#111214" },
  ],
  colorScheme: "light dark",
};

/** The edition picker's own root layout; it shares no chrome with any edition. */
export default function PickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-flavor="picker" className={fontVariables}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
