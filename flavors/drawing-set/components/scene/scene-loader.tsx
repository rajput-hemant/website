"use client";

import type { SceneRoute } from "@/flavors/drawing-set/lib/scene/poses";
import { cn } from "@/flavors/drawing-set/lib/utils";

import { useSceneMount } from "@/components/semantic/scene/use-scene-mount";

import { SceneNav } from "./scene-nav";

const importScene = () => import("./scene-root");

/**
 * Renders inside the Shell's scene slot, next to its `[data-scene-poster]`.
 * The shared mount hook picks the tier, loads the scene chunk once the slot
 * nears the viewport, borrows the one session canvas and hides the poster
 * once a frame is on screen; this adds the drawers nav on home, the tag that
 * names a hovered part's destination, and the tilt button.
 */
export function SceneLoader({
  route,
  callouts,
}: {
  route: SceneRoute;
  callouts?: Partial<Record<string, string>> | undefined;
}) {
  const { rootRef, hostRef, live, canTilt, enableTilt } = useSceneMount(
    route,
    importScene
  );
  const home = route === "home";

  return (
    <div ref={rootRef} data-scene-root className="absolute inset-0">
      <div
        ref={hostRef}
        aria-hidden
        className={cn(
          "absolute inset-0 touch-pan-y",
          home && "md:right-[190px]",
          live && "cursor-grab active:cursor-grabbing"
        )}
      />
      <svg
        data-scene-leaders
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      />
      {/* The world names the hovered part's destination here (world.tsx). */}
      <span
        data-scene-tag
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-10 border border-accent bg-ground px-2 py-1 font-mono text-mono-xs tracking-[0.08em] whitespace-nowrap text-accent uppercase opacity-0 transition-opacity duration-(--duration-ui) data-[on]:opacity-100"
      />
      {home && <SceneNav meta={callouts} />}
      {canTilt && (
        <button
          type="button"
          onClick={enableTilt}
          className="absolute top-3 left-4 border border-line-strong bg-ground px-2 py-1 font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase"
        >
          Tilt to turn
        </button>
      )}
    </div>
  );
}
