import { Chivo, Overpass_Mono, Public_Sans } from "next/font/google";

/* The 70s grotesk of the display lines: names, titles, figure numbers. */
const chivo = Chivo({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-chivo",
});

/* Reading text, 400 to 600: the federal design system's own face. */
const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public",
});

/* Telemetry: MET, figure captions, checklist keys. Not preloaded, so the page keeps two font preloads. */
const overpass = Overpass_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-overpass",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  chivo.variable,
  publicSans.variable,
  overpass.variable,
].join(" ");
