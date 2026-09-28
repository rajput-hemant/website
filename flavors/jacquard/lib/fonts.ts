import { Chivo_Mono, Hanken_Grotesk, Tenor_Sans } from "next/font/google";

/* Museum-label caps for the name and titles: one weight, preloaded. */
const tenor = Tenor_Sans({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-tenor",
});

/* Reading text, 400 to 600. */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

/* Draft numbers, accession numbers and selvedge lettering. */
const chivo = Chivo_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-chivo",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  tenor.variable,
  hanken.variable,
  chivo.variable,
].join(" ");
