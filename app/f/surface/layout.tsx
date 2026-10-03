import type { Metadata, Viewport } from "next";

import "@/flavors/surface/styles.css";

import { CommandMenu } from "@/flavors/surface/components/command/command-menu";
import { Cursor } from "@/flavors/surface/components/interaction/cursor";
import { PrefsSync } from "@/flavors/surface/components/prefs/prefs-sync";
import { ChannelShortcuts } from "@/flavors/surface/components/site/channel-shortcuts";
import { SkipLink } from "@/flavors/surface/components/site/page";
import { SiteFooter } from "@/flavors/surface/components/site/site-footer";
import { SiteHeader } from "@/flavors/surface/components/site/site-header";
import { fontVariables } from "@/flavors/surface/lib/fonts";
import { prefsScript } from "@/flavors/surface/lib/prefs-script";

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
  // Mirrors --color-plate in styles.css; a <meta> tag can't read a CSS variable.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d5d2ca" },
    { media: "(prefers-color-scheme: dark)", color: "#151514" },
  ],
  colorScheme: "light dark",
};

/**
 * The Control Surface edition's root layout: fonts, pre-paint prefs, the
 * faceplate header and rear-panel footer, and the keyboard singletons.
 */
export default async function SurfaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getSiteIdentity();
  return (
    // The pre-paint script mutates <html> attributes and style before hydration.
    <html
      lang="en"
      data-flavor="surface"
      // Route changes jump to the top; smooth scroll is for in-page moves.
      data-scroll-behavior="smooth"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <PrePaintScript html={prefsScript} />
      </head>
      <body>
        <SiteIdentityProvider identity={identity}>
          <SkipLink />
          <PrefsSync />
          <SiteHeader />
          {children}
          <SiteFooter />
          <CommandMenu />
          <ChannelShortcuts />
          <Cursor />
        </SiteIdentityProvider>
      </body>
    </html>
  );
}
