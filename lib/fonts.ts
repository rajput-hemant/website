import { Fraunces, Geist, Geist_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: "normal",
  axes: ["opsz", "SOFT"],
  display: "swap",
  variable: "--font-fraunces",
});

/* Italic only appears for emphasis inside prose, so it loads on first use. */
const frauncesItalic = Fraunces({
  subsets: ["latin"],
  style: "italic",
  axes: ["opsz", "SOFT"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces-italic",
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  fraunces.variable,
  frauncesItalic.variable,
  geist.variable,
  geistMono.variable,
].join(" ");
