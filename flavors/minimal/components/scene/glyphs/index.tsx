import type * as React from "react";
import type { GlyphKind } from "@/flavors/minimal/lib/scene/glyphs";

import { Beads } from "./beads";
import { Cards } from "./cards";
import { Clock } from "./clock";
import { Fan } from "./fan";
import { Folder } from "./folder";
import { Tenure } from "./tenure";

/** Every glyph the scene can draw, by kind. */
const glyphs: Partial<Record<GlyphKind, () => React.ReactNode>> = {
  clock: () => <Clock />,
  cards: () => <Cards />,
  fan: () => <Fan />,
  tenure: () => <Tenure />,
  beads: () => <Beads />,
  folder: () => <Folder />,
};

const isKind = (kind: string): kind is GlyphKind => Object.hasOwn(glyphs, kind);

export function renderGlyph(kind: string): React.ReactNode {
  return isKind(kind) ? glyphs[kind]?.() : null;
}
