import type { Metadata, Viewport } from "next";

import "@/flavors/drawing-set/styles.css";

import { CommandMenu } from "@/flavors/drawing-set/components/command";
import { PrefsSync } from "@/flavors/drawing-set/components/prefs/prefs-sync";
import {
  DeferredShell,
  DrawingFrame,
  SiteDock,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "@/flavors/drawing-set/components/site";
import { fontVariables } from "@/flavors/drawing-set/lib/fonts";
import { prefsScript } from "@/flavors/drawing-set/lib/prefs";

import { site } from "@/content/site";
import { titleTemplate } from "@/lib/metadata";
import { PrePaintScript } from "@/components/semantic/prefs/pre-paint-script";

/** First load of a session with motion on: the frame and title block plot in (after prefsScript sets data-motion). */
const plotScript = `try{var d=document.documentElement;if(d.dataset.motion==="on"&&!sessionStorage.getItem("hr:plotted")){sessionStorage.setItem("hr:plotted","1");d.dataset.plot="";setTimeout(function(){delete d.dataset.plot},2000)}}catch(e){}`;

export const metadata: Metadata = {
  title: { default: site.name, template: titleTemplate },
  description: site.description,
  metadataBase: new URL(site.url),
};

export const viewport: Viewport = {
  // Mirrors --color-ground in styles.css; a <meta> tag can't read a CSS variable.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceee9" },
    { media: "(prefers-color-scheme: dark)", color: "#0e2542" },
  ],
  colorScheme: "light dark",
  // So iOS reports non-zero env(safe-area-inset-*) values to styles.css.
  viewportFit: "cover",
};

/**
 * The Drawing Set edition's root layout: fonts, pre-paint prefs, the drawing
 * frame, header, footer, mobile dock, and the client singletons that survive
 * navigations. CommandMenu stays eager (keyboard shortcuts only, so ⌘K works
 * at once); the motion and pointer stack waits for idle in DeferredShell.
 */
export default function DrawingSetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The pre-paint scripts below mutate <html> attributes/style before hydration.
    <html
      lang="en"
      data-flavor="drawing-set"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <PrePaintScript html={prefsScript} />
        <PrePaintScript html={plotScript} />
      </head>
      <body>
        <SkipLink />
        <PrefsSync />
        <DrawingFrame />
        <div className="m-(--frame-inset) pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pt-3.5 md:pb-0 md:pl-3.5">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
        <SiteDock />
        <CommandMenu />
        <DeferredShell />
      </body>
    </html>
  );
}
