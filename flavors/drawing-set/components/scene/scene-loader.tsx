"use client";

import type { SceneRoute } from "@/flavors/drawing-set/lib/scene/poses";
import { cn } from "@/flavors/drawing-set/lib/utils";

import {
  InspectControl,
  InspectHint,
} from "@/components/semantic/scene/inspect-control";
import { useSceneMount } from "@/components/semantic/scene/use-scene-mount";

import { SceneNav } from "./scene-nav";

const importScene = () => import("./scene-root");

/**
 * Renders inside the Shell's scene slot, next to its `[data-scene-poster]`.
 * The shared mount hook picks the tier, loads the scene chunk once the slot
 * nears the viewport, draws the desk over `hostRef` on the session's fixed
 * canvas (z-10) and hides the poster once a frame is on screen; this adds
 * the drawers nav on home, the tag that names a hovered part's destination,
 * and the tilt button, all at z-20 so they paint over the canvas.
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
          live && "cursor-grab data-[inspect=drag]:cursor-grabbing"
        )}
      />
      <InspectControl
        target={hostRef}
        className={cn(
          "pointer-events-none absolute bottom-[4%] left-1/2 z-20 flex -translate-x-1/2 gap-1 opacity-0 focus-within:bg-ground/90 focus-within:opacity-100",
          home && "md:left-[calc(50%-95px)]"
        )}
        buttonClassName="size-11 border border-line-strong text-lg text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent"
      />
      <InspectHint
        target={hostRef}
        className={cn(
          "pointer-events-none absolute bottom-[12%] left-1/2 z-20 m-0 -translate-x-1/2 border border-line-strong bg-ground px-2 py-1 font-mono text-mono-xs tracking-[0.08em] whitespace-nowrap text-ink-soft uppercase",
          home && "md:left-[calc(50%-95px)]"
        )}
      />
      <svg
        data-scene-leaders
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible"
      />
      {/* The world names the hovered part's destination here (world.tsx). */}
      <span
        data-scene-tag
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-20 border border-accent bg-ground px-2 py-1 font-mono text-mono-xs tracking-[0.08em] whitespace-nowrap text-accent uppercase opacity-0 transition-opacity duration-(--duration-ui) data-[on]:opacity-100"
      />
      {home && <SceneNav meta={callouts} />}
      {canTilt && (
        <button
          type="button"
          onClick={enableTilt}
          className="absolute top-3 left-4 z-20 border border-line-strong bg-ground px-2 py-1 font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase"
        >
          Tilt to turn
        </button>
      )}
    </div>
  );
}
