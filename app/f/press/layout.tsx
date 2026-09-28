import type { Metadata, Viewport } from "next";

import "@/flavors/press/styles.css";

import { CommandMenu } from "@/flavors/press/components/command";
import { PrefsSync } from "@/flavors/press/components/prefs/prefs-sync";
import { DeferredShell } from "@/flavors/press/components/site/deferred-shell";
import { SheetFrame } from "@/flavors/press/components/site/sheet-frame";
import { SiteFooter } from "@/flavors/press/components/site/site-footer";
import { SiteHeader } from "@/flavors/press/components/site/site-header";
import { SkipLink } from "@/flavors/press/components/site/skip-link";
import { fontVariables } from "@/flavors/press/lib/fonts";
import { prefsScript } from "@/flavors/press/lib/prefs";

import { site } from "@/content/site";
import { titleTemplate } from "@/lib/metadata";
import { PrePaintScript } from "@/components/semantic/prefs/pre-paint-script";

export const metadata: Metadata = {
  title: { default: site.name, template: titleTemplate },
  description: site.description,
  metadataBase: new URL(site.url),
};

export const viewport: Viewport = {
  // The stock in each theme; a <meta> tag can't read a CSS variable.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e7e8e4" },
    { media: "(prefers-color-scheme: dark)", color: "#15181d" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

/**
 * The Press Proof edition's root layout: fonts, pre-paint prefs, the trimmed
 * sheet and its margin, and the client singletons that survive navigations.
 * ⌘K shortcuts are eager; the motion and pointer stack waits for idle.
 */
export default function PressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The pre-paint script mutates <html> attributes/style before hydration.
    <html
      lang="en"
      data-flavor="press"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <PrePaintScript html={prefsScript} />
      </head>
      <body className="pb-[env(safe-area-inset-bottom)] lg:p-m">
        <SkipLink />
        <PrefsSync />
        <SiteHeader />
        {children}
        <SiteFooter />
        <SheetFrame />
        <CommandMenu />
        <DeferredShell />
      </body>
    </html>
  );
}
