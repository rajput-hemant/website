"use client";

import type { SceneRoute } from "@/flavors/drawing-set/lib/scene/poses";
import { cn } from "@/flavors/drawing-set/lib/utils";

import { useSceneMount } from "@/components/semantic/scene/use-scene-mount";

import { SceneNav } from "./scene-nav";

const importScene = () => import("./scene-root");

/**
 * Renders inside the Shell's scene slot, next to its `[data-scene-poster]`.
 * The shared mount hook picks the tier, loads the scene chunk after load and
 * idle, borrows the one session canvas and hides the poster once a frame is
 * on screen; this adds the drawers nav on home and the tilt button.
 */
export function SceneLoader({
  route,
  callouts,
}: {
  route: SceneRoute;
  callouts?: Partial<Record<string, string>>;
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
