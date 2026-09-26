import { Public_Sans, Spectral, UnifrakturMaguntia } from "next/font/google";

/* Sheet names and regions: Spectral 500 in spaced caps. Preloaded. */
const spectralDisplay = Spectral({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  variable: "--font-spectral-display",
});

/* Notes, hydrography and the lede: Spectral text and italic, on demand. */
const spectral = Spectral({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-spectral",
});

/* US federal type in the USGS lineage: text, utility and grid numbers. Preloaded. */
const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

/* Lettering for antiquities, used once: the archived projects. */
const unifraktur = UnifrakturMaguntia({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-unifraktur",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  spectralDisplay.variable,
  spectral.variable,
  publicSans.variable,
  unifraktur.variable,
].join(" ");
