"use client";

import { createAccentHook } from "@/lib/lab/accent";

/** The visitor's redline hue and theme, live, for this edition's WebGL scenes. */
export const useAccent = createAccentHook({
  server: {
    hue: 75,
    accent: "rgb(196, 165, 116)",
    foreground: "rgb(28, 25, 23)",
    theme: "light",
  },
  accent: () => "var(--color-accent)",
  foreground: "var(--color-ink, CanvasText)",
  defaultHue: 75,
});
