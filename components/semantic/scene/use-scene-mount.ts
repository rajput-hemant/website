"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { postersOf, showPoster } from "@/lib/scene/poster";
import { sceneStore, type Tier } from "@/lib/scene/store";
import { detectTier } from "@/lib/scene/tier";
import { useMediaQuery } from "@/components/semantic/use-media-query";
import { useMotionOn, useRootData } from "@/components/semantic/use-root-data";

/** What an edition's lazy scene chunk exports. */
export type SceneModule = {
  mountScene: (
    host: HTMLElement,
    tier: 1 | 2,
    onReady: () => void
  ) => () => void;
  enableTilt: () => Promise<boolean>;
};

let scene: SceneModule | null = null;
let loading: Promise<SceneModule> | null = null;
/** The poster crossfades once per session; later slots swap instantly. */
let faded = false;

/** How close to the viewport a slot gets before the scene chunk is fetched. */
export const NEAR_MARGIN = "200px";

function load(importer: () => Promise<SceneModule>) {
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
    .then(importer)
    .then((m) => (scene = m));
  return loading;
}

/**
 * Calls `onNear` once `el` is within {@link NEAR_MARGIN} of the viewport, so
 * a slot below the fold (or hidden at this breakpoint) never pulls in
 * three.js until it's about to be seen. Returns a cancel function.
 */
function whenNear(el: Element, onNear: () => void): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onNear();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      io.disconnect();
      onNear();
    },
    { rootMargin: NEAR_MARGIN }
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * The scene loader contract (docs/m2-scene-spec.md), without markup: picks
 * the tier, loads the edition's scene chunk once the slot nears the viewport
 * (after load and idle), lends the session canvas to `hostRef`, and hands the
 * sibling `[data-scene-poster]` over once a frame is on screen. The poster
 * holds the slot's box until then, so nothing shifts. While `pauseScene()`
 * holds the scene the slot shows its poster. The edition renders the
 * elements.
 */
export function useSceneMount(
  route: string,
  importer: () => Promise<SceneModule>
) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pref = useRootData("scene", "auto");
  const motion = useMotionOn();
  const coarse = useMediaQuery("(pointer: coarse)");
  const [live, setLive] = React.useState(false);
  const [tilt, setTilt] = React.useState(false);
  const importRef = React.useRef(importer);

  React.useLayoutEffect(() => {
    sceneStore.setState({ route, navigate: (href) => router.push(href) });
  }, [route, router]);

  React.useLayoutEffect(() => {
    const host = hostRef.current;
    const slot = rootRef.current?.parentElement;
    const poster = slot ? (postersOf(slot)[0] ?? null) : null;
    if (!host) return;
    let detach: (() => void) | null = null;
    let alive = true;
    let unwatch = () => {};

    const handOff = (visible: boolean, fade: boolean) => {
      if (poster) showPoster(poster, visible, fade);
    };
    const start = (m: SceneModule) => {
      const { tier, paused } = sceneStore.getState();
      if (!alive || detach || !tier || paused) return;
      detach = m.mountScene(host, tier, () => {
        handOff(
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
      handOff(true, false);
      setLive(false);
    };

    const tier = Math.min(detectTier(), sceneStore.getState().maxTier) as Tier;
    sceneStore.setState({ tier });
    if (tier) {
      // Once the chunk is in, mount synchronously so a navigation swaps the
      // poster before paint; until then, wait for the slot to come near.
      if (scene) start(scene);
      else {
        unwatch = whenNear(host, () => {
          load(importRef.current).then(start, () => {});
        });
      }
    }
    const offTier = sceneStore.subscribe((s, prev) => {
      if (!s.tier && prev.tier) stop();
      // A foreign canvas holds the scene: back to the poster until released.
      if (s.paused && !prev.paused) stop();
      if (!s.paused && prev.paused && scene) start(scene);
    });
    return () => {
      alive = false;
      unwatch();
      offTier();
      stop();
    };
  }, [pref]);

  const canTilt =
    live &&
    motion &&
    coarse &&
    !tilt &&
    typeof DeviceOrientationEvent !== "undefined";
  const enableTilt = () => void scene?.enableTilt().then(setTilt);

  return { rootRef, hostRef, live, canTilt, enableTilt };
}
