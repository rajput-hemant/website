import { Bricolage_Grotesque, Fraunces, Martian_Mono } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
  variable: "--font-bricolage",
});

// Italic is loaded so emphasis in sans body text can switch to a true serif italic.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
  variable: "--font-fraunces",
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-martian-mono",
});

/** Class names that define the three font CSS variables; put them on <html>. */
export const fontVariables = [
  bricolage.variable,
  fraunces.variable,
  martianMono.variable,
].join(" ");
