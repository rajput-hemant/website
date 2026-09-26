"use client";

import * as React from "react";

export type SceneTheme = "light" | "dark";

export type AccentColors = {
  /** OKLCH hue from `--accent-hue`. */
  hue: number;
  /** Resolved accent colour as an sRGB `rgb()` string. */
  accent: string;
  /** Resolved text colour as an sRGB `rgb()` string. */
  foreground: string;
  theme: SceneTheme;
};

const DEFAULT_HUE = 38;

const serverSnapshot: AccentColors = {
  hue: DEFAULT_HUE,
  accent: "rgb(196, 98, 45)",
  foreground: "rgb(28, 25, 23)",
  theme: "light",
};

let snapshot: AccentColors | null = null;
let colorContext: CanvasRenderingContext2D | null | undefined;

/** Canvas converts any CSS colour (oklch, light-dark, color-mix) to sRGB bytes, which three.js can parse. */
function toRgb(cssColor: string, fallback: string): string {
  colorContext ??= document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  if (!colorContext) return fallback;
  colorContext.clearRect(0, 0, 1, 1);
  colorContext.fillStyle = fallback;
  colorContext.fillStyle = cssColor;
  colorContext.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = colorContext.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

function resolveTheme(root: HTMLElement): SceneTheme {
  const attribute = root.dataset.theme;
  if (attribute === "light" || attribute === "dark") return attribute;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readAccent(): AccentColors {
  const root = document.documentElement;
  const hue =
    Number.parseFloat(
      getComputedStyle(root).getPropertyValue("--accent-hue")
    ) || DEFAULT_HUE;
  const theme = resolveTheme(root);

  const probe = document.createElement("span");
  probe.style.color = `var(--color-accent, oklch(${theme === "dark" ? 0.77 : 0.54} 0.14 ${hue}))`;
  document.body.append(probe);
  const accent = getComputedStyle(probe).color;
  probe.style.color = "var(--color-foreground, CanvasText)";
  const foreground = getComputedStyle(probe).color;
  probe.remove();

  return {
    hue,
    accent: toRgb(accent, serverSnapshot.accent),
    foreground: toRgb(foreground, serverSnapshot.foreground),
    theme,
  };
}

function isSame(a: AccentColors, b: AccentColors) {
  return (
    a.hue === b.hue &&
    a.accent === b.accent &&
    a.foreground === b.foreground &&
    a.theme === b.theme
  );
}

function refresh() {
  const next = readAccent();
  if (!snapshot || !isSame(snapshot, next)) snapshot = next;
}

function subscribe(onChange: () => void) {
  const update = () => {
    const previous = snapshot;
    refresh();
    if (snapshot !== previous) onChange();
  };

  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme", "data-accent"],
  });
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  colorScheme.addEventListener("change", update);
  update();

  return () => {
    observer.disconnect();
    colorScheme.removeEventListener("change", update);
  };
}

function getSnapshot(): AccentColors {
  if (!snapshot) refresh();
  return snapshot ?? serverSnapshot;
}

/**
 * The visitor's accent and theme as resolved on <html>, kept live so the
 * Customize panel's accent and theme flow into WebGL scenes.
 */
export function useAccent(): AccentColors {
  return React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => serverSnapshot
  );
}
