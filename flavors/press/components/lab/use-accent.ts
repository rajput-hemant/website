"use client";

import { createAccentHook } from "@/lib/lab/accent";

/** P1 pink and the page's ink, live, for this edition's WebGL experiments. */
export const useAccent = createAccentHook({
  server: {
    hue: 345,
    accent: "rgb(255, 72, 176)",
    foreground: "rgb(42, 70, 144)",
    theme: "light",
  },
  accent: () => "var(--color-pink)",
  foreground: "var(--color-ink, CanvasText)",
  defaultHue: 345,
});
