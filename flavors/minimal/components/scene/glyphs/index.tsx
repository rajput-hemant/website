import type * as React from "react";
import type { GlyphKind } from "@/flavors/minimal/lib/scene/glyphs";

import { Beads } from "./beads";
import { Cards } from "./cards";
import { Clip } from "./clip";
import { Clock } from "./clock";
import { Crumple } from "./crumple";
import { Dogear } from "./dogear";
import { Envelopes } from "./envelopes";
import { Fan } from "./fan";
import { Folder } from "./folder";
import { Keytag } from "./keytag";
import { Letter } from "./letter";
import { Pad } from "./pad";
import { Padlock } from "./padlock";
import { Plane } from "./plane";
import { Roll } from "./roll";
import { Sheet } from "./sheet";
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
  sheet: () => <Sheet />,
  clip: () => <Clip />,
  padlock: () => <Padlock />,
  keytag: () => <Keytag />,
  crumple: () => <Crumple />,
  dogear: () => <Dogear />,
};

const isKind = (kind: string): kind is GlyphKind => Object.hasOwn(glyphs, kind);

export function renderGlyph(kind: string): React.ReactNode {
  return isKind(kind) ? glyphs[kind]?.() : null;
}
