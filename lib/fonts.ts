import { Archivo, Azeret_Mono, Newsreader } from "next/font/google";

/* Sheet titles use the condensed end of the width axis, statements the wide end. */
const archivo = Archivo({
  subsets: ["latin"],
  style: "normal",
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: "normal",
  axes: ["opsz"],
  display: "swap",
  variable: "--font-newsreader",
});

/* Italic only appears for emphasis inside prose, so it loads on first use. */
const newsreaderItalic = Newsreader({
  subsets: ["latin"],
  style: "italic",
  axes: ["opsz"],
  display: "swap",
  preload: false,
  variable: "--font-newsreader-italic",
});

const azeretMono = Azeret_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-azeret",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  archivo.variable,
  newsreader.variable,
  newsreaderItalic.variable,
  azeretMono.variable,
].join(" ");
