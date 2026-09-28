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
        className="pointer-events-none absolute bottom-[6%] left-1/2 z-10 size-11 -translate-x-1/2 rounded-full opacity-0 outline-offset-2 focus-visible:bg-ground/80 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="mx-auto size-5 fill-none stroke-ink stroke-[1.5]"
        >
          <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
          <path d="M18 3v4h-4M6 21v-4h4" />
        </svg>
      </InspectControl>
      <InspectHint
        target={hostRef}
        className="pointer-events-none absolute bottom-[14%] left-1/2 z-10 m-0 -translate-x-1/2 rounded-full bg-ground/85 px-3 py-1 spec whitespace-nowrap"
      />
    </div>
  );
}
