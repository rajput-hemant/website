"use client";

import { createAccentHook } from "@/lib/lab/accent";

/** Signal yellow and the page's theme, live, for this edition's WebGL experiments. */
export const useAccent = createAccentHook({
  server: {
    hue: 85,
    accent: "rgb(255, 194, 14)",
    foreground: "rgb(20, 25, 30)",
    theme: "light",
  },
  accent: () => "var(--color-signal)",
  foreground: "var(--color-ink, CanvasText)",
  defaultHue: 85,
});
