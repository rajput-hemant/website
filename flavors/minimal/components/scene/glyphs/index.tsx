import type * as React from "react";
import type { GlyphKind } from "@/flavors/minimal/lib/scene/glyphs";

/** Every glyph the scene can draw, by kind. */
const glyphs: Partial<Record<GlyphKind, () => React.ReactNode>> = {};

const isKind = (kind: string): kind is GlyphKind => Object.hasOwn(glyphs, kind);

export function renderGlyph(kind: string): React.ReactNode {
  return isKind(kind) ? glyphs[kind]?.() : null;
}
