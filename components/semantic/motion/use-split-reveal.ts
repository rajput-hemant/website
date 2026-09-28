"use client";

import * as React from "react";

import {
  belowFold,
  motionOn,
  mountedByNavigation,
  observeOnce,
} from "@/lib/motion/entrance";

const loadGsap = () => import("@/lib/motion/gsap");

/**
 * A heading's line reveal on client navigation or scroll-in, never on first
 * paint: words rise out of line masks. gsap and SplitText load only when a
 * split is about to run. Attach `ref` to the heading.
 */
export function useSplitReveal<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    const byNavigation = mountedByNavigation();
    if (!el || !motionOn()) return;
    if (!byNavigation && !belowFold(el)) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    const split = async (hidden: boolean) => {
      const started = performance.now();
      try {
        const { gsap, SplitText } = await loadGsap();
        // Too slow to still feel like an entrance: just show the heading.
        if (cancelled || (hidden && performance.now() - started > 400)) return;
        const instance = SplitText.create(el, {
          type: "lines,words",
          mask: "lines",
          autoSplit: true,
          aria: "auto",
          onSplit(self) {
            gsap.set(self.words, { yPercent: 100 });
            return gsap.to(self.words, {
              yPercent: 0,
              duration: 0.8,
              ease: "glide",
              stagger: 0.04,
            });
          },
        });
        revert = () => instance.revert();
      } catch {
        // The heading is already real text; a failed chunk only skips the reveal.
      } finally {
        if (hidden) el.style.visibility = "";
      }
    };

    if (byNavigation && !belowFold(el)) {
      el.style.visibility = "hidden";
      void split(true);
      return () => {
        cancelled = true;
        el.style.visibility = "";
        revert?.();
      };
    }

    const stopPreload = observeOnce(
      el,
      () => void loadGsap(),
      "0px 0px 100% 0px"
    );
    const stopReveal = observeOnce(el, () => void split(false));
    return () => {
      cancelled = true;
      stopPreload();
      stopReveal();
      revert?.();
    };
  }, []);

  return ref;
}
