"use client";

import * as React from "react";

import { belowFold, motionOn, observeOnce } from "@/lib/motion/entrance";
import { usePublicPathname } from "@/lib/public-pathname";

/**
 * Draws contours and transects in as they scroll into view: every
 * `[data-draw]` below the fold starts pending, and turns live once seen.
 * Lines already on screen at load are simply there.
 */
export function DrawReveal() {
  const pathname = usePublicPathname();

  React.useEffect(() => {
    if (!motionOn()) return;
    const stops: (() => void)[] = [];
    for (const el of document.querySelectorAll<SVGElement>("[data-draw]")) {
      if (!belowFold(el)) continue;
      for (const line of el.querySelectorAll<SVGGeometryElement>(
        ".draw-line"
      )) {
        line.style.setProperty("--len", `${Math.ceil(line.getTotalLength())}`);
      }
      el.dataset.draw = "pending";
      stops.push(
        observeOnce(el, () => {
          requestAnimationFrame(() => {
            el.dataset.draw = "";
          });
        })
      );
    }
    return () => {
      for (const stop of stops) stop();
    };
  }, [pathname]);

  return null;
}
