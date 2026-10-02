import { Archivo, Azeret_Mono, Newsreader } from "next/font/google";

/*
 * `adjustFontFallback` is off because styles.css declares metric-matched
 * stand-ins itself: next/font's generated fallback needs `local(Arial)`, which
 * systems that only ship the metric-compatible Liberation or Arimo faces do
 * not match, it ignores the width axis Archivo is set on, and it sizes Azeret
 * Mono as if it were proportional. Each face then swaps in without a shift.
 */

/* Sheet titles use the condensed end of the width axis, statements the wide end. */
const archivo = Archivo({
  subsets: ["latin"],
  style: "normal",
  axes: ["wdth"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-archivo",
});

/* Not preloaded: at 128KB it would blow the font budget, and the LCP is the Archivo name. */
const newsreader = Newsreader({
  subsets: ["latin"],
  style: "normal",
  axes: ["opsz"],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
  variable: "--font-newsreader",
});

/* Italic only appears for emphasis inside prose, so it loads on first use. */
const newsreaderItalic = Newsreader({
  subsets: ["latin"],
  style: "italic",
  axes: ["opsz"],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
  variable: "--font-newsreader-italic",
});

const azeretMono = Azeret_Mono({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-azeret",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  archivo.variable,
  newsreader.variable,
  newsreaderItalic.variable,
  azeretMono.variable,
].join(" ");
