import type { Metadata, Viewport } from "next";

import "@/flavors/darkroom/styles.css";

import { CommandMenu } from "@/flavors/darkroom/components/command";
import { PrefsSync } from "@/flavors/darkroom/components/prefs/prefs-sync";
import { DeferredShell } from "@/flavors/darkroom/components/site/deferred-shell";
import { SiteFooter } from "@/flavors/darkroom/components/site/site-footer";
import { SiteHeader } from "@/flavors/darkroom/components/site/site-header";
import { SkipLink } from "@/flavors/darkroom/components/site/skip-link";
import { fontVariables } from "@/flavors/darkroom/lib/fonts";
import { prefsScript } from "@/flavors/darkroom/lib/prefs";

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
    { media: "(prefers-color-scheme: light)", color: "#e8edf0" },
    { media: "(prefers-color-scheme: dark)", color: "#120605" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

/**
 * The Darkroom edition's root layout: fonts, pre-paint prefs, the header and
 * footer, and the client singletons that survive navigations. ⌘K shortcuts
 * are eager; the sheet, sound and preview layers wait for idle.
 */
export default function DarkroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The pre-paint script mutates <html> attributes/style before hydration.
    <html
      lang="en"
      data-flavor="darkroom"
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
