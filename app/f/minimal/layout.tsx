import type { Metadata, Viewport } from "next";

import "@/flavors/minimal/styles.css";

import { CommandMenu } from "@/flavors/minimal/components/command/command-menu";
import { InteractionLayer } from "@/flavors/minimal/components/interaction/interaction-layer";
import { PageTransition } from "@/flavors/minimal/components/interaction/page-transition";
import { PrefsScript } from "@/flavors/minimal/components/prefs/prefs-script";
import { PrefsSync } from "@/flavors/minimal/components/prefs/prefs-sync";
import { SiteFooter } from "@/flavors/minimal/components/site/site-footer";
import { SiteHeader } from "@/flavors/minimal/components/site/site-header";
import { SkipLink } from "@/flavors/minimal/components/site/skip-link";
import { fontVariables } from "@/flavors/minimal/lib/fonts";

import { getProfile, getSiteIdentity } from "@/lib/data";
import { baseOpenGraph, titleTemplate, twitterCard } from "@/lib/metadata";
import { DraftModeTools } from "@/sanity/components/draft-mode-tools";
import { SiteIdentityProvider } from "@/components/semantic/identity/site-identity";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return {
    metadataBase: new URL(site.url),
    title: { default: site.name, template: titleTemplate(site) },
    description: site.description,
    applicationName: site.name,
    authors: [{ name: site.name, url: site.url }],
    openGraph: baseOpenGraph(site),
    twitter: { card: twitterCard },
  };
}

// Approximations of the paper and ink backgrounds in styles.css.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1217" },
  ],
};

/** The Minimal edition's root layout: fonts, pre-paint prefs and the site chrome. */
export default async function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getSiteIdentity();
  const profile = await getProfile();

  return (
    // `data-scroll-behavior` lets Next jump route changes to the top instantly
    // while the CSS smooth scroll (styles.css) still animates in-page anchors.
    <html
      lang="en"
      data-flavor="minimal"
      className={fontVariables}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <PrefsScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteIdentityProvider identity={identity}>
          <SkipLink />
          <SiteHeader />
          <PageTransition>
            <main id="content" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
          </PageTransition>
          <SiteFooter links={profile.links} />
          <InteractionLayer />
          <CommandMenu />
          <PrefsSync />
          <DraftModeTools />
        </SiteIdentityProvider>
      </body>
    </html>
  );
}
