import type { Metadata, Viewport } from "next";

import "@/flavors/timetable/styles.css";

import { CommandMenu } from "@/flavors/timetable/components/command";
import { PrefsSync } from "@/flavors/timetable/components/prefs/prefs-sync";
import {
  DeferredShell,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "@/flavors/timetable/components/site";
import { fontVariables } from "@/flavors/timetable/lib/fonts";
import { prefsScript } from "@/flavors/timetable/lib/prefs-script";

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
  // The sign band's colour in each theme; a <meta> tag can't read a CSS variable.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14191e" },
    { media: "(prefers-color-scheme: dark)", color: "#070a0c" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

/**
 * The Timetable edition's root layout: fonts, pre-paint prefs, the sign band,
 * the foot of the concourse, and the client singletons that survive
 * navigations. CommandMenu stays eager (keyboard shortcuts only, so ⌘K works
 * at once); the motion and pointer stack waits for idle in DeferredShell.
 */
export default async function TimetableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getSiteIdentity();
  return (
    // The pre-paint script below mutates <html> attributes/style before hydration.
    <html
      lang="en"
      data-flavor="timetable"
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
