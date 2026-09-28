import type * as React from "react";
import type { ViewId } from "@/flavors/press/lib/scene/views";
import { cn } from "@/flavors/press/lib/utils";

/**
 * A tracked view's placeholder (docs/m2-scene-spec.md, "Viewport mode"):
 * the box the session draws one of the press's views into, holding its size
 * from the server so nothing shifts, with its poster underneath until the
 * view has drawn. The poster is the whole element on tier 0. Decorative:
 * every fact it shows is also in the page's text.
 */
export function ViewSlot({
  id,
  data,
  poster,
  className,
  style,
}: {
  id: ViewId;
  /** The view's facts, from `viewData` in `lib/scene/views.ts`. */
  data?: string;
  poster?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      data-scene-view={id}
      data-view={data}
      data-print="hide"
      className={cn("pointer-events-none relative", className)}
      style={style}
    >
      <div data-scene-poster aria-hidden className="absolute inset-0">
        {poster}
      </div>
    </div>
  );
}
