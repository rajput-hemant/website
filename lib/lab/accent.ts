"use client";

import * as React from "react";

import type { AccentColors, SceneTheme } from "./types";

export type AccentSource = {
  /** Shown during SSR and hydration, and used when a colour can't be parsed. */
  server: AccentColors;
  /** The CSS colour to resolve as the accent, e.g. `var(--color-accent)`. */
  accent: (theme: SceneTheme, hue: number) => string;
  /** The CSS colour to resolve as the text colour. */
  foreground: string;
  /** Read from `--accent-hue` when set, else this. */
  defaultHue: number;
};

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

const isSame = (a: AccentColors, b: AccentColors) =>
  a.hue === b.hue &&
  a.accent === b.accent &&
  a.foreground === b.foreground &&
  a.theme === b.theme;

/**
 * A live hook for an edition's accent and theme as resolved on <html>, so
 * preference changes flow into WebGL scenes. The edition names its tokens.
 */
export function createAccentHook(source: AccentSource): () => AccentColors {
  let snapshot: AccentColors | null = null;

  function read(): AccentColors {
    const root = document.documentElement;
    const hue =
      Number.parseFloat(
        getComputedStyle(root).getPropertyValue("--accent-hue")
      ) || source.defaultHue;
    const theme = resolveTheme(root);
    const probe = document.createElement("span");
    probe.style.color = source.accent(theme, hue);
    document.body.append(probe);
    const accent = getComputedStyle(probe).color;
    probe.style.color = source.foreground;
    const foreground = getComputedStyle(probe).color;
    probe.remove();
    return {
      hue,
      accent: toRgb(accent, source.server.accent),
      foreground: toRgb(foreground, source.server.foreground),
      theme,
    };
  }

  function refresh() {
    const next = read();
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
    return snapshot ?? source.server;
  }

  return function useAccent() {
    return React.useSyncExternalStore(
      subscribe,
      getSnapshot,
      () => source.server
    );
  };
}
