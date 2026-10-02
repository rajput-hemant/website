"use client";

import * as React from "react";
import type { BenchOptions } from "@/flavors/surface/components/scene/bench";
import { usePrefs } from "@/flavors/surface/lib/prefs-store";

import { detectTier } from "@/lib/scene/tier";
import { useIdleReady } from "@/components/semantic/use-idle-ready";

export type Handle = { detach: () => void };

/**
 * Put a 3D instrument on the bench once the browser is idle, on capable
 * devices only. `open` loads the part's chunk and mounts it in the host;
 * it reads the latest props, so it never re-runs for a prop change (push
 * those to the handle instead). The root gets `data-bench-live` while the
 * instrument draws, which hides its printed poster (`data-bench-poster`);
 * at T0, over the page's budget or on context loss the poster stays.
 */
export function useInstrument<H extends Handle>(
  open: (host: HTMLElement, options: BenchOptions) => Promise<H>,
  enabled = true
) {
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const hostRef = React.useRef<HTMLSpanElement>(null);
  const handle = React.useRef<H | null>(null);
  const ready = useIdleReady(2500);
  const scene = usePrefs().scene;
  const load = React.useEffectEvent(open);

  React.useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!ready || !enabled || !root || !host) return;
    const tier = detectTier();
    if (tier === 0) return;
    let cancelled = false;
    const poster = () => {
      delete root.dataset.benchLive;
    };
    const live = () => {
      root.dataset.benchLive = "";
    };
    void load(host, { tier, onLost: poster, onRestored: live }).then(
      (mounted) => {
        if (cancelled) {
          mounted.detach();
          return;
        }
        handle.current = mounted;
        live();
      }
    );
    return () => {
      cancelled = true;
      handle.current?.detach();
      handle.current = null;
      poster();
    };
  }, [ready, enabled, scene]);

  return { rootRef, hostRef, handle };
}
