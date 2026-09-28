import { SceneLoader } from "@/flavors/jacquard/components/scene/scene-loader";
import {
  encodeWeave,
  type SceneRoute,
  type Weave,
} from "@/flavors/jacquard/lib/scene/poses";
import { cn } from "@/flavors/jacquard/lib/utils";

import { ScenePoster } from "./scene-poster";

export type { SceneRoute };

/**
 * Where the cloth hangs on this page: the drawn poster plus the loader,
 * which lends the session's one canvas to this slot and fades the poster
 * once a frame is on screen. The weave rides on `data-scene-board`.
 */
export function SceneSlot({
  route,
  weave,
  caption,
  fill = false,
  className,
}: {
  route: SceneRoute;
  weave: Weave;
  caption: string;
  /** Fill the parent's height instead of keeping the poster's aspect. */
  fill?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("m-0 flex flex-col", fill && "h-full", className)}>
      <div
        data-scene-slot
        data-scene-route={route}
        data-scene-board={encodeWeave(weave)}
        style={{ viewTransitionName: "scene" }}
        className={cn(
          "relative w-full",
          fill ? "min-h-0 flex-1" : "aspect-[5/6]"
        )}
      >
        <div
          data-scene-poster
          aria-hidden
          className="absolute inset-0 transition-opacity duration-(--duration-ui)"
        >
          <ScenePoster route={route} weave={weave} />
        </div>
        <SceneLoader route={route} />
      </div>
      <figcaption className="mt-2 max-w-[30ch] text-sm leading-snug text-ink-soft">
        {caption}
      </figcaption>
    </figure>
  );
}
