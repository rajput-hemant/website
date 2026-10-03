"use client";

import * as React from "react";

import { PrePaintScript } from "@/components/semantic/prefs/pre-paint-script";

const APPLE_UA = /Mac|iPhone|iPad|iPod/;

/** True on Apple platforms, where the menu's key is ⌘K rather than Ctrl K. */
export const isApplePlatform = () => APPLE_UA.test(navigator.userAgent);

/**
 * Runs before first paint, so the label's CSS already knows the platform when
 * the header is painted. Keep it in step with `isApplePlatform`.
 */
const platformScript = `document.documentElement.dataset.platform=/Mac|iPhone|iPad|iPod/.test(navigator.userAgent)?"apple":"other"`;

/**
 * The menu's key hint, "⌘K" or "Ctrl K". The server cannot know the platform,
 * so it renders both labels and the pre-paint script picks one with CSS
 * (`shortcut-label.css`, imported by each edition's styles):
 * nothing swaps after hydration, so the hint is exactly as wide as the label
 * shown and shifts no layout. Place it inside the edition's key styling.
 */
export function ShortcutLabel() {
  // A document React rendered on the client gets no pre-paint script.
  React.useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.platform) {
      root.dataset.platform = isApplePlatform() ? "apple" : "other";
    }
  }, []);

  return (
    <>
      <PrePaintScript html={platformScript} />
      <span data-hint="other">Ctrl K</span>
      <span data-hint="apple">⌘K</span>
    </>
  );
}
