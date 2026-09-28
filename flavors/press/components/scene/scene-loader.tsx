"use client";

import type { SceneRoute } from "@/flavors/press/lib/scene/poses";
import { cn } from "@/flavors/press/lib/utils";

import { useSceneMount } from "@/components/semantic/scene/use-scene-mount";

const importScene = () => import("./scene-root");

/** The host the shared mount hook lends the session canvas to, plus tilt on touch screens. */
export function SceneLoader({ route }: { route: SceneRoute }) {
  const { rootRef, hostRef, live, canTilt, enableTilt } = useSceneMount(
    route,
    importScene
  );
  return (
    <div
      ref={rootRef}
      data-scene-root
      data-scene-live={live ? "" : undefined}
      className="absolute inset-0"
    >
      <div
        ref={hostRef}
        aria-hidden
        data-cursor={live ? "Peel" : undefined}
        className={cn(
          "absolute inset-0 touch-pan-y",
          live && "cursor-grab active:cursor-grabbing"
        )}
      />
      {canTilt && (
        <button
          type="button"
          onClick={enableTilt}
          className="absolute right-0 bottom-0 min-h-11 bg-sheet px-3 slug text-ink! shadow-[inset_0_0_0_1px_var(--color-rule)]"
        >
          Tilt the press
        </button>
      )}
    </div>
  );
}
