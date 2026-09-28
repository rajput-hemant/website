import { SceneLoader } from "@/flavors/timetable/components/scene/scene-loader";
import type { SceneRoute } from "@/flavors/timetable/lib/scene/poses";
import { cn } from "@/flavors/timetable/lib/utils";

import { SceneDock } from "./scene-dock";
import { ScenePoster } from "./scene-poster";

export type { SceneRoute };
export type SceneSize = "hero" | "header" | "mini" | "none";

const SIZE_CLASS: Record<Exclude<SceneSize, "none">, string> = {
  hero: "aspect-[16/11] max-h-[62svh] w-full",
  header: "aspect-[16/10] max-h-[40svh] w-full",
  mini: "aspect-[16/7] max-h-[28svh] w-full",
};

/**
 * Where the indicator hangs on this page: the route's static drawing plus
 * the loader, which lends the session's one canvas to this slot and fades
 * the drawing once it renders. `board` overrides what it reads at rest;
 * `dock` lets it follow the reader into the page's `SceneDockTarget`, and
 * `live={false}` keeps the drawing only (for a page with its own canvas).
 */
export function SceneSlot({
  route,
  size = "header",
  board,
  dock,
  live = true,
  className,
}: {
  route: SceneRoute;
  size?: SceneSize;
  /** `"TOP|BOTTOM|TAG"`: the page's own resting board. */
  board?: string | undefined;
  dock?: boolean | undefined;
  live?: boolean | undefined;
  className?: string;
}) {
  if (size === "none") return null;
  const scene = (
    <>
      <div
        data-scene-poster
        aria-hidden
        className="absolute inset-0 transition-opacity duration-(--duration-ui)"
      >
        <ScenePoster route={route} board={board} />
      </div>
      {live ? <SceneLoader route={route} /> : null}
    </>
  );
  return (
    <div
      data-scene-slot
      data-scene-route={route}
      data-scene-size={size}
      data-scene-board={board}
      style={{ viewTransitionName: "scene" }}
      className={cn("relative", SIZE_CLASS[size], className)}
    >
      {dock ? <SceneDock>{scene}</SceneDock> : scene}
    </div>
  );
}
