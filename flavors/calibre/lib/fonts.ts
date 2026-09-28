import { Alegreya_Sans, Alegreya_Sans_SC, Bodoni_Moda } from "next/font/google";

/* The dial printer's Didone: the name, numerals and Roman hour marks. One variable file. */
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni",
});

/* Its italic, for the second word of a title; not preloaded, to keep three preloads. */
const bodoniItalic = Bodoni_Moda({
  subsets: ["latin"],
  style: "italic",
  display: "swap",
  preload: false,
  variable: "--font-bodoni-italic",
});

/* The text face, regular and medium. */
const alegreya = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-alegreya",
});

/* Small caps for the technical sheet; never preloaded. */
const alegreyaSc = Alegreya_Sans_SC({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  preload: false,
  variable: "--font-alegreya-sc",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  bodoni.variable,
  bodoniItalic.variable,
  alegreya.variable,
  alegreyaSc.variable,
].join(" ");
