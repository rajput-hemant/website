"use client";

import type { SceneRoute } from "@/flavors/calibre/lib/scene/poses";
import { cn } from "@/flavors/calibre/lib/utils";

import { useSceneMount } from "@/components/semantic/scene/use-scene-mount";

const importScene = () => import("./scene-root");

/** The host the shared mount hook lends the session canvas to. Touch turns the movement sideways only, so the page still scrolls. */
export function SceneLoader({ route }: { route: SceneRoute }) {
  const { rootRef, hostRef, live } = useSceneMount(route, importScene);
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
        className={cn(
          "absolute inset-0 touch-pan-y",
          live && "cursor-grab active:cursor-grabbing"
        )}
      />
    </div>
  );
}
