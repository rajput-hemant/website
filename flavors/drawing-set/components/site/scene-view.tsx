import type * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

export type SceneViewId =
  | "scale"
  | "stack"
  | "year-scale"
  | "dividers"
  | "piles"
  | "flight"
  | "glyph-a"
  | "glyph-b"
  | "glyph-c";

/**
 * A tracked view's placeholder (docs/guides/m2-scene-spec.md, "Viewport mode"):
 * its box, which the session draws a view of the desk into, and the view's
 * printed poster, which holds the box (CLS 0), stays at T0 and fades once
 * the view has drawn. Decorative: the page states everything it shows.
 * `data` carries what the view needs from the page (`data-*` attributes).
 */
export function SceneView({
  id,
  poster,
  className,
  data,
  ref,
}: {
  id: SceneViewId;
  ref?: React.Ref<HTMLDivElement>;
  poster?: React.ReactNode;
  className?: string;
  data?: Record<`data-${string}`, string | number>;
}) {
  return (
    <div
      ref={ref}
      aria-hidden
      data-scene-view={id}
      className={cn("relative", className)}
      {...data}
    >
      {poster ? (
        <div data-scene-poster className="absolute inset-0">
          {poster}
        </div>
      ) : null}
    </div>
  );
}
