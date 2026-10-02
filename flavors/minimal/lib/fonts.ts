import { Bricolage_Grotesque, Fraunces, Martian_Mono } from "next/font/google";

/*
 * `adjustFontFallback` is off because styles.css declares the metric-matched
 * stand-ins itself: next/font's generated fallback needs `local(Arial)`, and
 * sizes Martian Mono as if it were proportional (its uppercase meta labels
 * then change width by half when the face swaps in).
 */

/* Only the display serif is preloaded (it is the LCP headline); the rest swap in, which keeps preloads under the 120KB font budget. */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
  variable: "--font-bricolage",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: "normal",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-fraunces",
});

/*
 * Italic appears only for emphasis inside prose, so it loads on first use
 * instead of competing with the first paint. `--font-serif-italic` in
 * globals.css falls back to the upright face (synthesised) until it arrives.
 */
const frauncesItalic = Fraunces({
  subsets: ["latin"],
  style: "italic",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
  variable: "--font-fraunces-italic",
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
  variable: "--font-martian-mono",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  bricolage.variable,
  fraunces.variable,
  frauncesItalic.variable,
  martianMono.variable,
].join(" ");
