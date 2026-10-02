import type * as React from "react";
import type { GlyphKind } from "@/flavors/minimal/lib/scene/glyphs";

import { Beads } from "./beads";
import { Cards } from "./cards";
import { Clock } from "./clock";
import { Envelopes } from "./envelopes";
import { Fan } from "./fan";
import { Folder } from "./folder";
import { Letter } from "./letter";
import { Pad } from "./pad";
import { Plane } from "./plane";
import { Roll } from "./roll";
import { Spines } from "./spines";
import { Tabs } from "./tabs";
import { Tenure } from "./tenure";
import { Thread } from "./thread";

/** Every glyph the scene can draw, by kind. */
const glyphs: Partial<Record<GlyphKind, () => React.ReactNode>> = {
  clock: () => <Clock />,
  cards: () => <Cards />,
  fan: () => <Fan />,
  tenure: () => <Tenure />,
  beads: () => <Beads />,
  folder: () => <Folder />,
  pad: () => <Pad />,
  tabs: () => <Tabs />,
  spines: () => <Spines />,
  roll: () => <Roll />,
  plane: () => <Plane />,
  envelopes: () => <Envelopes />,
  letter: () => <Letter />,
  thread: () => <Thread />,
};

const isKind = (kind: string): kind is GlyphKind => Object.hasOwn(glyphs, kind);

export function renderGlyph(kind: string): React.ReactNode {
  return isKind(kind) ? glyphs[kind]?.() : null;
}
