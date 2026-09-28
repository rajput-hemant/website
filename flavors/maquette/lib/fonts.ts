import { Albert_Sans, Chivo_Mono, Jost } from "next/font/google";

/* Display and plaque caps: geometric, in the Futura line of model-shop lettering. */
const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});

/* The text face: a plain, open grotesk for reading. */
const albert = Albert_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-albert",
});

/* Readouts: dates, dimensions and the clock. Small and never above the fold's first line, so not preloaded. */
const chivo = Chivo_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-chivo",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  jost.variable,
  albert.variable,
  chivo.variable,
].join(" ");
