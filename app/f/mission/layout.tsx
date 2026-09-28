import type { Metadata, Viewport } from "next";

import "@/flavors/mission/styles.css";

import { CommandMenu } from "@/flavors/mission/components/command";
import { PrefsSync } from "@/flavors/mission/components/prefs/prefs-sync";
import { DeferredShell } from "@/flavors/mission/components/site/deferred-shell";
import { SiteFooter } from "@/flavors/mission/components/site/site-footer";
import { SiteHeader } from "@/flavors/mission/components/site/site-header";
import { SkipLink } from "@/flavors/mission/components/site/skip-link";
import { fontVariables } from "@/flavors/mission/lib/fonts";
import { prefsScript } from "@/flavors/mission/lib/prefs";

import { getSiteIdentity } from "@/lib/data";
import { titleTemplate } from "@/lib/metadata";
import { SiteIdentityProvider } from "@/components/semantic/identity/site-identity";
import { PrePaintScript } from "@/components/semantic/prefs/pre-paint-script";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return {
    title: { default: site.name, template: titleTemplate(site) },
    description: site.description,
    metadataBase: new URL(site.url),
  };
}

export const viewport: Viewport = {
  // The ground in each theme; a <meta> tag can't read a CSS variable.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d7d8d3" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1427" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

/**
 * The Mission edition's root layout: fonts, pre-paint prefs, the header and
 * footer of the sample book, and the client singletons that survive
 * navigations. ⌘K shortcuts are eager; sound, Lenis and previews wait for idle.
 */
export default async function MissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getSiteIdentity();
  return (
    // The pre-paint script mutates <html> attributes/style before hydration.
    <html
      lang="en"
      data-flavor="mission"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <PrePaintScript html={prefsScript} />
      </head>
      <body className="pb-[env(safe-area-inset-bottom)]">
        <SiteIdentityProvider identity={identity}>
          <SkipLink />
          <PrefsSync />
          <SiteHeader />
          {children}
          <SiteFooter />
          <CommandMenu />
          <DeferredShell />
        </SiteIdentityProvider>
      </body>
    </html>
  );
}
