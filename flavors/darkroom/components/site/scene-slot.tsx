import { LazySceneLoader } from "@/flavors/darkroom/components/scene/lazy-scene-loader";
import { poses, type SceneRoute } from "@/flavors/darkroom/lib/scene/poses";
import { cn } from "@/flavors/darkroom/lib/utils";

import { ScenePoster } from "./scene-poster";

export type { SceneRoute };

/**
 * Where the developer tray sits on this page: the drawn poster plus the
 * loader, which lends the session's one canvas to this slot and fades the
 * poster once a frame is on screen. `board` is the print's frames, encoded
 * by `encodeBoard`, so the poster and the scene show the same print.
 */
export function SceneSlot({
  route,
  board = null,
  label,
  className,
}: {
  route: SceneRoute;
  board?: string | null;
  /** What lies in the tray, pinned at its top left. */
  label?: string;
  className?: string;
}) {
  return (
    <figure className={cn("group/fig relative m-0", className)}>
      <div
        data-scene-slot
        data-scene-route={route}
        data-scene-board={board ?? undefined}
        style={{ viewTransitionName: "scene" }}
        className="relative aspect-[640/460] w-full"
      >
        <div
          data-scene-poster
          aria-hidden
          className="absolute inset-0 transition-opacity duration-(--duration-ui)"
        >
          <ScenePoster route={route} board={board} />
        </div>
        <LazySceneLoader route={route} />
      </div>
      <figcaption className="pointer-events-none flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-2">
        <span className="edge">
          In the tray{" "}
          <b className="font-sans text-sm font-semibold tracking-normal text-ink normal-case">
            {label ?? poses[route].caption}
          </b>
        </span>
        <span
          aria-hidden
          className="hidden edge fine:group-has-[[data-scene-live]]/fig:inline"
        >
          Move to ripple / drag to rock the tray
        </span>
      </figcaption>
    </figure>
  );
}
