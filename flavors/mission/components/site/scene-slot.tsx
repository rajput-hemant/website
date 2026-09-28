import { SceneLoader } from "@/flavors/mission/components/scene/scene-loader";
import {
  encodeBoard,
  SITE,
  type Board,
  type SceneRoute,
} from "@/flavors/mission/lib/scene/poses";
import { cn } from "@/flavors/mission/lib/utils";

import { ScenePoster } from "./scene-poster";

export type { SceneRoute };

/**
 * Fig. 1 on this page: the drawn globe plus the loader, which lends the
 * session's one canvas to this slot and fades the poster once a frame is on
 * screen. The orbits ride on `data-scene-board`.
 */
export function SceneSlot({
  route,
  board,
  caption,
  title = "Launch site and phase orbits",
  fill = false,
  className,
}: {
  route: SceneRoute;
  board: Board;
  caption: string;
  title?: string;
  /** Fill the parent's height instead of keeping a square. */
  fill?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn("m-0 flex flex-col gap-3", fill && "h-full", className)}
    >
      <p className="flex flex-wrap justify-between gap-x-4 gap-y-1 label text-ink-soft">
        <span>
          <b className="font-semibold text-ink">Fig. 1</b>&nbsp; {title}
        </span>
        <span>
          {SITE.lat.toFixed(2)}° N {SITE.lon.toFixed(2)}° E
        </span>
      </p>
      <div
        data-scene-slot
        data-scene-route={route}
        data-scene-board={encodeBoard(board)}
        style={{ viewTransitionName: "scene" }}
        className={cn(
          "relative w-full",
          fill ? "min-h-[18rem] flex-1" : "aspect-square"
        )}
      >
        <div
          data-scene-poster
          aria-hidden
          className="absolute inset-0 transition-opacity duration-(--duration-ui)"
        >
          <ScenePoster route={route} board={board} />
        </div>
        <SceneLoader route={route} />
      </div>
      <figcaption className="flex flex-wrap justify-between gap-x-4 gap-y-1 label">
        <span>{caption}</span>
        <span>Drag to rotate</span>
      </figcaption>
    </figure>
  );
}
