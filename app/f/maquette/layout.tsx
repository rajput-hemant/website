import type { Metadata, Viewport } from "next";

import "@/flavors/maquette/styles.css";

import { CommandMenu } from "@/flavors/maquette/components/command";
import { PrefsSync } from "@/flavors/maquette/components/prefs/prefs-sync";
import { DeferredShell } from "@/flavors/maquette/components/site/deferred-shell";
import { SiteFooter } from "@/flavors/maquette/components/site/site-footer";
import { SiteHeader } from "@/flavors/maquette/components/site/site-header";
import { SkipLink } from "@/flavors/maquette/components/site/skip-link";
import { fontVariables } from "@/flavors/maquette/lib/fonts";
import { prefsScript } from "@/flavors/maquette/lib/prefs";

import { site } from "@/content/site";
import { titleTemplate } from "@/lib/metadata";
import { PrePaintScript } from "@/components/semantic/prefs/pre-paint-script";

export const metadata: Metadata = {
  title: { default: site.name, template: titleTemplate },
  description: site.description,
  metadataBase: new URL(site.url),
};

export const viewport: Viewport = {
  // The ground in each theme; a <meta> tag can't read a CSS variable.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e3e4e1" },
    { media: "(prefers-color-scheme: dark)", color: "#101113" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

/**
 * The Maquette edition's root layout: fonts, pre-paint prefs, the header and
 * footer, and the client singletons that survive navigations. ⌘K shortcuts
 * are eager; the sound and preview layers wait for idle.
 */
export default function MaquetteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The pre-paint script mutates <html> attributes/style before hydration.
    <html
      lang="en"
      data-flavor="maquette"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <PrePaintScript html={prefsScript} />
      </head>
      <body className="pb-[env(safe-area-inset-bottom)]">
        <SkipLink />
        <PrefsSync />
        <SiteHeader />
        {children}
        <SiteFooter />
        <CommandMenu />
        <DeferredShell />
      </body>
    </html>
  );
}
