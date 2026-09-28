import {
  Rock_Salt,
  Schibsted_Grotesk,
  Sofia_Sans_Extra_Condensed,
} from "next/font/google";

/* The text face: a newsy grotesk, heavy for names, plain for reading. */
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
});

/* Edge print: frame numbers, DX codes and the stock name along the rebate. One variable file. */
const sofia = Sofia_Sans_Extra_Condensed({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sofia",
});

/* The grease pencil, only for tags on marked frames; never preloaded. */
const rockSalt = Rock_Salt({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-rock-salt",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [
  schibsted.variable,
  sofia.variable,
  rockSalt.variable,
].join(" ");
