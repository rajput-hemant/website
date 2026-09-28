"use client";

import { createAccentHook } from "@/lib/lab/accent";

/** The steel pencil and the page's ink, live, for this edition's WebGL experiments. */
export const useAccent = createAccentHook({
  server: {
    hue: 32,
    accent: "rgb(255, 178, 107)",
    foreground: "rgb(243, 214, 194)",
    theme: "dark",
  },
  accent: () => "var(--color-steel)",
  foreground: "var(--color-ink, CanvasText)",
  defaultHue: 32,
});
