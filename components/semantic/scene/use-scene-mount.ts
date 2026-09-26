"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
 * The scene loader contract (docs/m2-scene-spec.md), without markup: picks
 * the tier, loads the edition's scene chunk after load and idle, lends the
 * session canvas to `hostRef`, and hands the sibling `[data-scene-poster]`
 * over once a frame is on screen. The edition renders the elements.
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
      detach = m.mountScene(host, tier as 1 | 2, () => {
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
      else load(importRef.current).then(start, () => {});
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

  const canTilt =
    live &&
    motion &&
    coarse &&
    !tilt &&
    typeof DeviceOrientationEvent !== "undefined";
  const enableTilt = () => void scene?.enableTilt().then(setTilt);

  return { rootRef, hostRef, live, canTilt, enableTilt };
}
