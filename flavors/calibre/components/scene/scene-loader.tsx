"use client";

import type { SceneRoute } from "@/flavors/calibre/lib/scene/poses";
import { cn } from "@/flavors/calibre/lib/utils";

import {
  InspectControl,
  InspectHint,
} from "@/components/semantic/scene/inspect-control";
import { useSceneMount } from "@/components/semantic/scene/use-scene-mount";

const importScene = () => import("./scene-root");

/**
 * The host the shared mount hook lends the session canvas to. Dragging turns
 * the movement all the way round (on touch, a sideways move or two fingers,
 * so the page still scrolls), pinch or ctrl + scroll zooms, and a double
 * click or tap resets. The keyboard twin and the one-time hint sit beside
 * the host, never inside it, and appear once the scene is live.
 */
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
          live && "cursor-grab data-[inspect=drag]:cursor-grabbing"
        )}
      />
      <InspectControl
        target={hostRef}
        className="pointer-events-none absolute bottom-[6%] left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full opacity-0 focus-within:bg-ground/80 focus-within:opacity-100"
        buttonClassName="size-11 rounded-full text-lg text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus"
      />
      <InspectHint
        target={hostRef}
        className="pointer-events-none absolute bottom-[14%] left-1/2 z-10 m-0 -translate-x-1/2 rounded-full bg-ground/85 px-3 py-1 spec whitespace-nowrap"
      />
    </div>
  );
}
