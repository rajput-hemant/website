import { Barlow, Barlow_Semi_Condensed, Doto } from "next/font/google";

/* Legends and display: DIN-lineage engraving. The LCP is set in this face. */
const barlowSc = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--font-barlow-sc",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-barlow",
});

/* The dot-matrix line only; it loads on first use. */
const doto = Doto({
  subsets: ["latin"],
  weight: "800",
  display: "swap",
  preload: false,
  variable: "--font-doto",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  barlowSc.variable,
  barlow.variable,
  doto.variable,
].join(" ");
