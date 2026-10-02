import { cn } from "@/flavors/drawing-set/lib/utils";

import { GlyphPoster, type GlyphKind } from "./glyph-posters";
import { SceneView } from "./scene-view";

/**
 * A glyph view (audit appendix B slice 8): a small tracked view of one
 * object, drawn in the box it holds. It answers to the nearest
 * `[data-glyph-host]` ancestor (a card, row or button), and `slot` picks
 * which of the page's three glyph ids it takes, since the session tracks at
 * most four views a page with the slot. `data-press`: "hover" or "enter"
 * for a stamp; `data-pad` gives it an ink pad; `data-study` picks the solid.
 */
export function SceneGlyph({
  kind,
  slot,
  className,
  data,
}: {
  kind: GlyphKind;
  slot: "a" | "b" | "c";
  className?: string;
  data?: Record<`data-${string}`, string | number>;
}) {
  return (
    <SceneView
      id={`glyph-${slot}`}
      className={cn("pointer-events-none size-8 shrink-0", className)}
      data={{ "data-glyph": kind, ...data }}
      poster={<GlyphPoster kind={kind} />}
    />
  );
}
