"use client";

import { createAccentHook } from "@/lib/lab/accent";

/** Madder and the page's ink, live, for this edition's WebGL experiments. */
export const useAccent = createAccentHook({
  server: {
    hue: 10,
    accent: "rgb(155, 45, 59)",
    foreground: "rgb(30, 33, 37)",
    theme: "light",
  },
  accent: () => "var(--color-madder)",
  foreground: "var(--color-ink, CanvasText)",
  defaultHue: 10,
});
