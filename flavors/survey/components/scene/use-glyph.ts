"use client";

import * as React from "react";
import { usePrefs } from "@/flavors/survey/lib/prefs-store";

import type { GlyphOptions } from "@/lib/scene/blit";
import { detectTier } from "@/lib/scene/tier";
import { useIdleReady } from "@/components/semantic/use-idle-ready";

import { bindHoverGlyph, type HoverHooks } from "./hover-glyph";

export type Detachable = { detach(): void };

/** Options the glyph modules take: the engine's, plus a call each time it rests. */
export type OpenOptions = GlyphOptions & { onRest?: () => void };

/**
 * Imports the glyph's chunk (so three.js loads lazily) and resolves to the
 * function that attaches it into a host.
 */
export type Loader<H extends Detachable> = () => Promise<
  (host: HTMLElement, options: OpenOptions) => H
>;

/**
 * When the glyph may load: once the browser is idle, never at T0, and again
 * whenever the 3D preference changes (the tier with it).
 */
function useReady(): string | null {
  const ready = useIdleReady(2500);
  const scene = usePrefs().scene;
  return ready ? scene : null;
}

/** The live tier, or null at T0. */
function liveTier(): 1 | 2 | null {
  const tier = detectTier();
  return tier === 0 ? null : tier;
}

/**
 * Keeps a glyph attached to `hostRef` and marks `rootRef` `data-live` while
 * it draws (the poster fades out under it). With `inView` it attaches only
 * while the root is within half a screen of the viewport, so a long page's
 * glyphs never hold more than the engine's four slots. `key` remounts it.
 */
export function useGlyph<H extends Detachable>(
  rootRef: React.RefObject<HTMLElement | null>,
  hostRef: React.RefObject<HTMLElement | null>,
  load: Loader<H>,
  { inView = false, key = "" }: { inView?: boolean; key?: string } = {}
): React.RefObject<H | null> {
  const glyph = React.useRef<H | null>(null);
  const ready = useReady();
  const loadGlyph = React.useEffectEvent(load);

  React.useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    const tier = ready === null ? null : liveTier();
    if (!tier || !root || !host) return;
    let generation = 0;
    const poster = () => {
      delete root.dataset.live;
    };
    const live = () => {
      root.dataset.live = "";
    };
    const start = () => {
      const mine = ++generation;
      void loadGlyph().then((attach) => {
        if (mine !== generation) return;
        glyph.current = attach(host, {
          tier,
          onLost: poster,
          onRestored: live,
        });
        live();
      });
    };
    const stop = () => {
      generation++;
      glyph.current?.detach();
      glyph.current = null;
      poster();
    };
    if (!inView) {
      start();
      return stop;
    }
    let shown = false;
    const seen = new IntersectionObserver(
      ([entry]) => {
        const near = !!entry?.isIntersecting;
        if (near === shown) return;
        shown = near;
        if (near) start();
        else stop();
      },
      { rootMargin: "50% 0px" }
    );
    seen.observe(root);
    return () => {
      seen.disconnect();
      stop();
    };
  }, [ready, inView, key, rootRef, hostRef]);

  return glyph;
}

/**
 * A glyph that draws only while `target` (found from the root) is pointed
 * at with a mouse, then rests, hands back to its poster and detaches (see
 * `bindHoverGlyph`). Touch keeps the printed poster.
 */
export function useHoverGlyph<H extends Detachable>(
  rootRef: React.RefObject<HTMLElement | null>,
  hostRef: React.RefObject<HTMLElement | null>,
  {
    load,
    target,
    enter,
    leave,
    move,
  }: {
    load: Loader<H>;
    target: (root: HTMLElement) => HTMLElement | null;
    enter: (glyph: H) => void;
    leave: (glyph: H) => void;
    move?: (glyph: H, event: PointerEvent) => void;
  },
  key = ""
) {
  const ready = useReady();
  const loadGlyph = React.useEffectEvent(load);
  const find = React.useEffectEvent(target);
  const onEnter = React.useEffectEvent(enter);
  const onLeave = React.useEffectEvent(leave);
  const onMove = React.useEffectEvent((glyph: H, event: PointerEvent) => {
    move?.(glyph, event);
  });

  React.useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    const over = root ? find(root) : null;
    const tier = ready === null ? null : liveTier();
    if (!tier || !root || !host || !over) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let cancelled = false;
    let attach: ((host: HTMLElement, options: OpenOptions) => H) | null = null;
    void loadGlyph().then((fn) => {
      if (!cancelled) attach = fn;
    });
    const unbind = bindHoverGlyph<H>({
      target: over,
      root,
      open: (hooks: HoverHooks) => attach?.(host, { tier, ...hooks }) ?? null,
      enter: onEnter,
      leave: onLeave,
      move: onMove,
    });
    return () => {
      cancelled = true;
      unbind();
    };
  }, [ready, key, rootRef, hostRef]);
}
