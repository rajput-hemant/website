"use client";

import { createAccentHook } from "@/lib/lab/accent";

/** Water blue and the page's theme, live, for this edition's WebGL experiments. */
export const useAccent = createAccentHook({
  server: {
    hue: 240,
    accent: "rgb(37, 95, 138)",
    foreground: "rgb(28, 42, 43)",
    theme: "light",
  },
  accent: () => "var(--color-water)",
  foreground: "var(--color-ink, CanvasText)",
  defaultHue: 240,
});
