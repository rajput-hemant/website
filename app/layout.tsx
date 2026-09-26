import type { Metadata } from "next";

import "./globals.css";

import { site } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
import { titleTemplate } from "@/lib/metadata";

export const metadata: Metadata = {
  title: { default: site.name, template: titleTemplate },
  description: site.description,
  metadataBase: new URL(site.url),
};

// Placeholder layout for Milestone 0. Real UI comes later.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
