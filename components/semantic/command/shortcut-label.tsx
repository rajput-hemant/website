"use client";

import { PrePaintScript } from "@/components/semantic/prefs/pre-paint-script";

/**
 * Runs before first paint, so the label's CSS already knows the platform when
 * the header is painted. A document React renders on the client gets no
 * pre-paint script and keeps "Ctrl K".
 */
const platformScript = `/Mac|iPhone|iPad|iPod/.test(navigator.userAgent)&&(document.documentElement.dataset.platform="apple")`;

/**
 * The menu's key hint, "⌘K" or "Ctrl K". The server cannot know the platform,
 * so it renders both labels and the pre-paint script picks one with CSS
 * (`shortcut-label.css`, imported by each edition's styles): nothing swaps
 * after hydration, so the hint is exactly as wide as the label shown and
 * shifts no layout. Place it inside the edition's key styling.
 */
export function ShortcutLabel() {
  return (
    <>
      <PrePaintScript html={platformScript} />
      <span data-hint="other">Ctrl K</span>
      <span data-hint="apple">⌘K</span>
    </>
  );
}
