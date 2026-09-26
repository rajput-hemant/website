import { Libre_Franklin, Martian_Mono } from "next/font/google";

/* An American press gothic: 900 for the plates, 500 and 400 for reading. */
const franklin = Libre_Franklin({
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  variable: "--font-franklin",
});

/* Slugs, stamps and readouts, set at 75% width. */
const martian = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-martian",
});

/** Class names that define the font CSS variables; put them on <html>. */
export const fontVariables = [franklin.variable, martian.variable].join(" ");
