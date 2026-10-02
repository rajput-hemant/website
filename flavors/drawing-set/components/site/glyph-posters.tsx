import type * as React from "react";

/*
 * The glyph views' printed posters: each glyph at rest, as a 32 unit line
 * drawing. They hold the box (CLS 0), stay at T0 and fade once the view has
 * drawn.
 */

export type GlyphKind =
  "sheet" | "stamp" | "pin" | "clip" | "solid" | "plotter" | "dial";

const DRAWINGS: Record<GlyphKind, React.ReactNode> = {
  sheet: (
    <>
      <path d="M3 12 16 6l13 6-13 6Z" />
      <path d="M3 12v3l13 6 13-6v-3M16 18v3" />
      <path d="m18 13 5-2.4 3 1.4-5 2.4Z" />
    </>
  ),
  stamp: (
    <>
      <path d="M8 24h16v-4H8ZM13 20v-8M19 20v-8M11 12h10v-3H11Z" />
      <path d="M5 27h22" />
    </>
  ),
  pin: (
    <>
      <path d="M4 20h12M16 20l12 0" />
      <circle cx="16" cy="20" r="3" />
      <path d="M14.5 20h3M16 18.5v3" />
    </>
  ),
  clip: (
    <path d="M10 26V9a4 4 0 0 1 8 0v14M18 23a3 3 0 0 1-6 0V11a3 3 0 0 1 6 0v8" />
  ),
  solid: (
    <>
      <path d="m16 4 10 6v12l-10 6L6 22V10Z" />
      <path d="M6 10l10 6 10-6M16 16v12" />
    </>
  ),
  plotter: (
    <>
      <path d="M3 14h26v4H3Z" />
      <path d="M9 14v-4h5v4M11.5 18v5" />
    </>
  ),
  dial: (
    <>
      <circle cx="16" cy="17" r="10" />
      <path d="M16 4v4M16 17l5-5M16 11v2M23 17h-2M16 23v-2M9 17h2" />
    </>
  ),
};

export function GlyphPoster({ kind }: { kind: GlyphKind }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      fill="none"
      strokeWidth="1"
      className="size-full overflow-visible stroke-ink-soft [&_*]:[vector-effect:non-scaling-stroke]"
    >
      {DRAWINGS[kind]}
    </svg>
  );
}
