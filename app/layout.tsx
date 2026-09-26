import type { Metadata, Viewport } from "next";

import "./globals.css";

import { site } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
import { titleTemplate } from "@/lib/metadata";
import { prefsScript } from "@/lib/prefs";

/** First load of a session with motion on: the frame and title block plot in (after prefsScript sets data-motion). */
const plotScript = `try{var d=document.documentElement;if(d.dataset.motion==="on"&&!sessionStorage.getItem("hr:plotted")){sessionStorage.setItem("hr:plotted","1");d.dataset.plot="";setTimeout(function(){delete d.dataset.plot},2000)}}catch(e){}`;

export const metadata: Metadata = {
  title: { default: site.name, template: titleTemplate },
  description: site.description,
  metadataBase: new URL(site.url),
};

export const viewport: Viewport = {
  // Mirrors --color-ground in app/globals.css; a <meta> tag can't read a CSS variable.
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#eceee9",
    },
    { media: "(prefers-color-scheme: dark)", color: "#0e2542" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The pre-paint script below mutates <html> attributes/style before hydration.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
        <script dangerouslySetInnerHTML={{ __html: plotScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
