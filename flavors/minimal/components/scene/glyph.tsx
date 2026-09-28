import * as React from "react";
import {
  glyphViews,
  type GlyphKind,
  type GlyphViewId,
} from "@/flavors/minimal/lib/scene/glyphs";
import { cn } from "@/flavors/minimal/lib/utils";

import { GlyphLead } from "./glyph-lead";

/**
 * The DOM side of a glyph (docs/minimal.md, "3D"). A glyph is a box in the
 * text that holds its poster, the SVG or CSS drawing that is also the T0,
 * no-JS and print-free state. Once its 3D has drawn, the box reads
 * `data-glyph-live` and the poster fades (styles.css).
 *
 * - `lead`: the page's slot. It carries the loader, so the scene chunk is
 *   fetched only once this glyph nears the viewport.
 * - `view`: a placeholder the session draws as another view.
 * - neither: poster only (past the page's four views).
 */
export function Glyph({
  kind,
  lead = false,
  view,
  input = false,
  className,
  style,
  data,
  children,
}: {
  kind: GlyphKind;
  lead?: boolean;
  view?: GlyphViewId | undefined;
  /** Lets pointer events reach the glyph (a drag); otherwise it's inert. */
  input?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Extra `data-glyph-*` values the 3D reads (a time zone, a count). */
  data?: Readonly<Record<string, string | number>>;
  /** The poster. */
  children: React.ReactNode;
}) {
  const extra = Object.fromEntries(
    Object.entries(data ?? {}).map(([key, value]) => [
      `data-glyph-${key}`,
      String(value),
    ])
  );
  return (
    <span
      aria-hidden
      data-decorative
      {...glyphProps(kind, view)}
      {...extra}
      className={cn(
        "relative inline-block shrink-0 align-middle",
        input ? "touch-pan-y" : "pointer-events-none",
        className
      )}
      style={style}
    >
      <GlyphPoster>{children}</GlyphPoster>
      {lead && <GlyphLead kind={kind} input={input} />}
    </span>
  );
}

/**
 * The attributes that make an element a glyph: its kind, and for a
 * placeholder the view id. For content that is itself the view (a list whose
 * rows carry the pieces), spread these on the list.
 */
export function glyphProps(kind: GlyphKind, view?: GlyphViewId) {
  if (view && glyphViews[view] !== kind) {
    throw new Error(
      `Glyph view ${view} draws ${glyphViews[view]}, not ${kind}`
    );
  }
  return {
    "data-glyph": kind,
    ...(view && { "data-scene-view": view }),
  };
}

/** A glyph's poster; it holds the box, so nothing shifts when it fades. */
export function GlyphPoster({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      data-glyph-poster
      aria-hidden
      className={cn("absolute inset-0 grid place-items-center", className)}
    >
      {children}
    </span>
  );
}

/**
 * One piece of a list glyph (a card on a row, a bead on the rail), placed by
 * the 3D from this box. `id` is the row's `data-scene-item`.
 */
export function GlyphAnchor({
  id,
  className,
  data,
  children,
}: {
  id: string;
  className?: string;
  data?: Readonly<Record<string, string | number | boolean>>;
  children?: React.ReactNode;
}) {
  const extra = Object.fromEntries(
    Object.entries(data ?? {}).flatMap(([key, value]) =>
      value === false ? [] : [[`data-glyph-${key}`, String(value)]]
    )
  );
  return (
    <span
      aria-hidden
      data-decorative
      data-glyph-anchor={id}
      {...extra}
      className={cn("pointer-events-none relative inline-block", className)}
    >
      {children}
    </span>
  );
}
