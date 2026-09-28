import { SceneLoader } from "@/flavors/drawing-set/components/scene/scene-loader";
import type { SceneRoute } from "@/flavors/drawing-set/lib/scene/poses";
import { cn } from "@/flavors/drawing-set/lib/utils";

import { ScenePoster } from "./scene-posters";

export type { SceneRoute };

export type SceneSize = "hero" | "fill" | "window" | "band" | "none";

const SIZE_CLASS: Record<Exclude<SceneSize, "none">, string> = {
  hero: "h-[56svh] md:h-[78svh]",
  fill: "h-full min-h-[40svh]",
  window: "h-[40svh] md:h-[44vh]",
  band: "h-[40svh] md:h-[55vh]",
};

/**
 * Where the scene sits on this page: the route's linework poster plus the
 * loader, which lends the session's one canvas to this slot and fades the
 * poster once it renders. Without WebGL the poster stays as the fallback.
 */
export function SceneSlot({
  route,
  size = "window",
  callouts,
  className,
}: {
  route: SceneRoute;
  size?: SceneSize;
  /** Home only: the drawer callouts' meta lines, keyed by href. */
  callouts?: Partial<Record<string, string>>;
  className?: string;
}) {
  if (size === "none") return null;

  return (
    <div
      data-scene-slot
      data-scene-route={route}
      data-scene-size={size}
      style={{ viewTransitionName: "scene" }}
      className={cn("relative w-full", SIZE_CLASS[size], className)}
    >
      <div
        data-scene-poster
        aria-hidden
        className="absolute inset-0 p-4 transition-opacity duration-(--duration-ui) md:p-8"
      >
        <ScenePoster route={route} />
      </div>
      <SceneLoader route={route} callouts={callouts} />
    </div>
  );
}
