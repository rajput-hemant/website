"use client";

import type { SceneRoute } from "@/flavors/timetable/lib/scene/poses";
import { cn } from "@/flavors/timetable/lib/utils";

import { useSceneMount } from "@/components/semantic/scene/use-scene-mount";

const importScene = () => import("./scene-root");

/**
 * Renders inside the scene slot, next to its `[data-scene-poster]`: the host
 * the shared mount hook lends the session canvas to, plus the tilt button on
 * touch screens.
 */
export function SceneLoader({ route }: { route: SceneRoute }) {
  const { rootRef, hostRef, live, canTilt, enableTilt } = useSceneMount(
    route,
    importScene
  );

  return (
    <div ref={rootRef} data-scene-root className="absolute inset-0">
      <div
        ref={hostRef}
        aria-hidden
        data-cursor={live ? "Swing" : undefined}
        className={cn(
          "absolute inset-0 touch-pan-y",
          live && "cursor-grab active:cursor-grabbing"
        )}
      />
      {canTilt && (
        <button
          type="button"
          onClick={enableTilt}
          className="absolute right-0 bottom-0 min-h-11 rounded-md border border-rule-strong bg-ground px-3 font-mono text-mono-xs font-semibold tracking-[0.08em] text-ink uppercase"
        >
          Tilt to swing
        </button>
      )}
    </div>
  );
}
