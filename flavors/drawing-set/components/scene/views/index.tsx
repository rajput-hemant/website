import type { SceneViews } from "@/lib/scene/session";

import { createDividers } from "./dividers-view";
import { createFlight } from "./flight-view";
import { createGlyph } from "./glyph-view";
import { TrackedView } from "./kit";
import { createPiles } from "./piles-view";
import { createScale } from "./scale-view";
import { createStack } from "./stack-view";
import { createYearScale } from "./year-scale-view";

/**
 * The Drawing Set's tracked views (audit appendix B slice 7), by
 * `data-scene-view` id; `components/site/scene-view.tsx` renders their
 * placeholders, with posters from view-posters.tsx and scene-posters.tsx.
 */
export const views: SceneViews = {
  scale: () => <TrackedView id="scale" create={createScale} />,
  stack: () => <TrackedView id="stack" create={createStack} />,
  "year-scale": () => <TrackedView id="year-scale" create={createYearScale} />,
  dividers: () => <TrackedView id="dividers" create={createDividers} />,
  piles: () => <TrackedView id="piles" create={createPiles} />,
  flight: () => <TrackedView id="flight" create={createFlight} />,
  // Glyph views: one pool of ids, so a page can place up to three.
  "glyph-a": () => <TrackedView id="glyph-a" create={createGlyph} />,
  "glyph-b": () => <TrackedView id="glyph-b" create={createGlyph} />,
  "glyph-c": () => <TrackedView id="glyph-c" create={createGlyph} />,
};
