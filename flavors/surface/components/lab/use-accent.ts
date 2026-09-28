"use client";

import { createAccentHook } from "@/lib/lab/accent";

/** Signal yellow and the plate's theme, live, for this edition's WebGL scenes. */
export const useAccent = createAccentHook({
  server: {
    hue: 85,
    accent: "rgb(242, 183, 5)",
    foreground: "rgb(26, 26, 24)",
    theme: "light",
  },
  accent: () => "var(--color-signal)",
  foreground: "var(--color-ink, CanvasText)",
  defaultHue: 85,
});
