import { SheetGround } from "@/flavors/survey/components/relief/sheet-ground";
import { readout, type Relief } from "@/flavors/survey/lib/relief";
import {
  encodeBoard,
  poseFor,
  type SceneRoute,
} from "@/flavors/survey/lib/scene/poses";
import { cn } from "@/flavors/survey/lib/utils";

import { SceneLoader } from "./scene-loader";
import { SlotReadout } from "./slot-readout";

/**
 * An inset of the sheet in a page header: this page's grid square, framed
 * by a neat line with its reference. The flat drawing is the poster and the
 * fallback; the session's relief canvas flies in over it and the loupe
 * follows the pointer. `target` is a site slug or role id to centre on.
 */
export function SceneSlot({
  relief,
  route,
  target,
  className,
}: {
  relief: Relief;
  route: SceneRoute;
  target?: string;
  className?: string;
}) {
  const pose = poseFor(relief, route, target);
  const { cx, cy, w, h } = pose.window;
  return (
    <figure className={cn("m-0 grid gap-2", className)}>
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="caps text-ink-faint">Inset</span>
        <span className="caps text-water tabular-nums">Grid {pose.label}</span>
      </figcaption>
      <div
        data-scene-slot
        data-scene-route={route}
        data-scene-board={encodeBoard(relief, pose)}
        className="relative aspect-[4/3] w-full overflow-hidden border border-rule-strong bg-ground"
      >
        <div
          data-scene-poster
          aria-hidden
          className="absolute inset-0 transition-opacity duration-(--duration-ui)"
        >
          <svg
            viewBox={`${cx - w / 2} ${cy - h / 2} ${w} ${h}`}
            preserveAspectRatio="xMidYMid meet"
            className="size-full"
          >
            <SheetGround relief={relief} id={`inset-${route}`} />
          </svg>
        </div>
        <SceneLoader route={route} window={pose.window} focus={pose.focus} />
      </div>
      <SlotReadout
        relief={relief}
        initial={readout(relief, pose.focus.x, pose.focus.p)}
      />
    </figure>
  );
}
