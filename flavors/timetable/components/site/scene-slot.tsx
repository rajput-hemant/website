import { SceneLoader } from "@/flavors/timetable/components/scene/scene-loader";
import type { SceneRoute } from "@/flavors/timetable/lib/scene/poses";
import { cn } from "@/flavors/timetable/lib/utils";

import { ScenePoster } from "./scene-poster";

export type { SceneRoute };
export type SceneSize = "hero" | "header" | "none";

const SIZE_CLASS: Record<Exclude<SceneSize, "none">, string> = {
  hero: "aspect-[16/11] max-h-[62svh] w-full",
  header: "aspect-[16/10] max-h-[40svh] w-full",
};

/**
 * Where the indicator hangs on this page: the route's static drawing plus
 * the loader, which lends the session's one canvas to this slot and fades
 * the drawing once it renders. `board` overrides what it reads at rest.
 */
export function SceneSlot({
  route,
  size = "header",
  board,
  className,
}: {
  route: SceneRoute;
  size?: SceneSize;
  /** `"TOP|BOTTOM|TAG"`: the page's own resting board. */
  board?: string;
  className?: string;
}) {
  if (size === "none") return null;
  return (
    <div
      data-scene-slot
      data-scene-route={route}
      data-scene-size={size}
      data-scene-board={board}
      style={{ viewTransitionName: "scene" }}
      className={cn("relative", SIZE_CLASS[size], className)}
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
  );
}
