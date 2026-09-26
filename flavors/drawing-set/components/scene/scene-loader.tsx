"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/flavors/drawing-set/lib/hooks/use-media-query";
import type { SceneRoute } from "@/flavors/drawing-set/lib/scene/poses";
import { sceneStore, type Tier } from "@/flavors/drawing-set/lib/scene/store";
import { detectTier } from "@/flavors/drawing-set/lib/scene/tier";
import { cn } from "@/flavors/drawing-set/lib/utils";

import { useMotionOn, useRootData } from "@/components/semantic/use-root-data";

import { SceneNav } from "./scene-nav";

type SceneModule = typeof import("./scene-root");

let scene: SceneModule | null = null;
let loading: Promise<SceneModule> | null = null;
/** The poster crossfades once per session; later slots swap instantly. */
let faded = false;

function load() {
  loading ??= new Promise<void>((resolve) => {
    const idle = () => {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => resolve(), { timeout: 2500 });
      } else {
        setTimeout(resolve, 300);
      }
    };
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
  })
    .then(() => import("./scene-root"))
    .then((m) => (scene = m));
  return loading;
}

/**
 * Renders inside the Shell's scene slot, next to its `[data-scene-poster]`.
 * Picks the tier, loads the scene chunk after load + idle, borrows the one
 * session canvas and hides the poster once a frame is on screen.
 */
export function SceneLoader({
  route,
  callouts,
}: {
  route: SceneRoute;
  callouts?: Partial<Record<string, string>>;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pref = useRootData("scene", "auto");
  const motion = useMotionOn();
  const coarse = useMediaQuery("(pointer: coarse)");
  const [live, setLive] = React.useState(false);
  const [tilt, setTilt] = React.useState(false);

  React.useLayoutEffect(() => {
    sceneStore.setState({ route, navigate: (href) => router.push(href) });
  }, [route, router]);

  React.useLayoutEffect(() => {
    const host = hostRef.current;
    const poster =
      rootRef.current?.parentElement?.querySelector<HTMLElement>(
        ":scope > [data-scene-poster]"
      ) ?? null;
    if (!host) return;
    let detach: (() => void) | null = null;
    let alive = true;

    const showPoster = (visible: boolean, fade: boolean) => {
      if (!poster) return;
      poster.style.transition = fade ? "opacity 400ms ease" : "";
      poster.style.opacity = visible ? "" : "0";
      poster.dataset.scenePoster = visible ? "" : "hidden";
    };
    const start = (m: SceneModule) => {
      const { tier } = sceneStore.getState();
      if (!alive || detach || !tier) return;
      detach = m.mountScene(host, tier, () => {
        showPoster(
          false,
          !faded && document.documentElement.dataset.motion === "on"
        );
        faded = true;
        setLive(true);
      });
    };
    const stop = () => {
      detach?.();
      detach = null;
      showPoster(true, false);
      setLive(false);
    };

    const tier = Math.min(detectTier(), sceneStore.getState().maxTier) as Tier;
    sceneStore.setState({ tier });
    if (tier) {
      if (scene) start(scene);
      else load().then(start, () => {});
    }
    const offTier = sceneStore.subscribe((s, prev) => {
      if (!s.tier && prev.tier) stop();
    });
    return () => {
      alive = false;
      offTier();
      stop();
    };
  }, [pref]);

  const home = route === "home";
  const canTilt =
    live &&
    motion &&
    coarse &&
    !tilt &&
    typeof DeviceOrientationEvent !== "undefined";

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
          onClick={() => void scene?.enableTilt().then(setTilt)}
          className="absolute top-3 left-4 border border-line-strong bg-ground px-2 py-1 font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase"
        >
          Tilt to turn
        </button>
      )}
    </div>
  );
}
