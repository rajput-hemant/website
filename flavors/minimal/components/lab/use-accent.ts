"use client";

import { createAccentHook } from "@/lib/lab/accent";

/** The visitor's accent and theme, live, for this edition's WebGL scenes. */
export const useAccent = createAccentHook({
  server: {
    hue: 38,
    accent: "rgb(196, 98, 45)",
    foreground: "rgb(28, 25, 23)",
    theme: "light",
  },
  accent: (theme, hue) =>
    `var(--color-accent, oklch(${theme === "dark" ? 0.77 : 0.54} 0.14 ${hue}))`,
  foreground: "var(--color-foreground, CanvasText)",
  defaultHue: 38,
});
