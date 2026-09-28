import type { Metadata, Viewport } from "next";

import "@/flavors/survey/styles.css";

import { CommandMenu } from "@/flavors/survey/components/command";
import { PrefsSync } from "@/flavors/survey/components/prefs/prefs-sync";
import {
  DeferredShell,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "@/flavors/survey/components/site";
import { fontVariables } from "@/flavors/survey/lib/fonts";
import { prefsScript } from "@/flavors/survey/lib/prefs";

import { site } from "@/content/site";
import { titleTemplate } from "@/lib/metadata";
import { PrePaintScript } from "@/components/semantic/prefs/pre-paint-script";

export const metadata: Metadata = {
  title: { default: site.name, template: titleTemplate },
  description: site.description,
  metadataBase: new URL(site.url),
};

export const viewport: Viewport = {
  // The survey paper and the night chart; a <meta> tag can't read a CSS variable.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dfe6dd" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1417" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

/**
 * The Field Survey edition's root layout: fonts, pre-paint prefs, the
 * sheet's margins, and the client singletons that survive navigations.
 * CommandMenu stays eager (shortcuts only); the motion and pointer stack
 * waits for idle in DeferredShell.
 */
export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The pre-paint script mutates <html> attributes/style before hydration.
    <html
      lang="en"
      data-flavor="survey"
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
