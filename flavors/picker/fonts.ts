import { Geist, Instrument_Serif } from "next/font/google";

/* The heading is the LCP, so only the display face preloads. */
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-picker-serif",
});

const sans = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-picker-sans",
});

export const fontVariables = `${serif.variable} ${sans.variable}`;
