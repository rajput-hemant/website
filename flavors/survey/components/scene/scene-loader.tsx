"use client";

import * as React from "react";
import { aimLoupe, placeLoupe, restLoupe } from "@/flavors/survey/lib/loupe";
import { SHEET } from "@/flavors/survey/lib/relief";
import {
  fit,
  type Focus,
  type SceneRoute,
  type SheetWindow,
} from "@/flavors/survey/lib/scene/poses";

import { useSceneMount } from "@/components/semantic/scene/use-scene-mount";

const importScene = () => import("./scene-root");

/**
 * Renders inside a scene slot, next to its `[data-scene-poster]`: the host
 * the shared mount hook lends the session canvas to. With `interactive`, a
 * pointer over the slot moves the loupe across the part of the sheet it
 * shows (the home map's overlay does this itself).
 */
export function SceneLoader({
  route,
  window: win,
  focus,
  interactive = true,
}: {
  route: SceneRoute;
  window: SheetWindow;
  focus: Focus;
  interactive?: boolean;
}) {
  const { rootRef, hostRef, live } = useSceneMount(route, importScene);

  React.useLayoutEffect(() => {
    placeLoupe(focus.x, focus.p);
  }, [focus.x, focus.p]);

  const aim = (event: React.PointerEvent<HTMLDivElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    const view = fit(win, r.width / Math.max(1, r.height));
    const x = view.cx + ((event.clientX - r.left) / r.width - 0.5) * view.w;
    const y = view.cy + ((event.clientY - r.top) / r.height - 0.5) * view.h;
    aimLoupe(x, (y - SHEET.Y0) / SHEET.YS);
  };

  return (
    <div ref={rootRef} data-scene-root className="absolute inset-0">
      <div
        ref={hostRef}
        aria-hidden
        data-cursor={interactive ? "none" : undefined}
        onPointerMove={interactive ? aim : undefined}
        onPointerDown={interactive ? aim : undefined}
        onPointerLeave={
          interactive
            ? (event) => {
                if (event.pointerType === "mouse") restLoupe();
              }
            : undefined
        }
        className="absolute inset-0 touch-pan-y"
        data-live={live || undefined}
      />
    </div>
  );
}
