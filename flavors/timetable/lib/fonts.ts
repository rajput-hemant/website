import { Overpass, Overpass_Mono } from "next/font/google";

/* Highway Gothic lineage, built for wayfinding: display and text in one family. */
const overpass = Overpass({
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  variable: "--font-overpass",
});

/* Flap cells, times, platform numbers and table heads. */
const overpassMono = Overpass_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-overpass-mono",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [overpass.variable, overpassMono.variable].join(
  " "
);
