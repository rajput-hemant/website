import { SceneLoader } from "@/flavors/press/components/scene/scene-loader";
import type { SceneRoute } from "@/flavors/press/lib/scene/poses";
import { cn } from "@/flavors/press/lib/utils";

import { ScenePoster } from "./scene-poster";

export type { SceneRoute };

/**
 * Where the press sits on this page: the drawn poster plus the loader, which
 * lends the session's one canvas to this slot and fades the poster once a
 * frame is on screen.
 */
export function SceneSlot({
  route,
  className,
}: {
  route: SceneRoute;
  className?: string;
}) {
  return (
    <figure className={cn("group/fig m-0", className)}>
      <div
        data-scene-slot
        data-scene-route={route}
        style={{ viewTransitionName: "scene" }}
        className="relative aspect-[560/460] w-full"
      >
        <div
          data-scene-poster
          aria-hidden
          className="absolute inset-0 transition-opacity duration-(--duration-ui)"
        >
          <ScenePoster route={route} />
        </div>
        <SceneLoader route={route} />
      </div>
      <figcaption
        aria-hidden
        className="mt-2 hidden slug fine:group-has-[[data-scene-live]]/fig:block"
      >
        Fig. {route === "home" ? 1 : 2} &nbsp;The press: P1 and P2 drums. Drag
        the corner to peel it; all the way turns the page.
      </figcaption>
    </figure>
  );
}
