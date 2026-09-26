"use client";

import * as React from "react";

import { belowFold, observeOnce } from "@/lib/motion/entrance";
import { usePublicPathname } from "@/lib/public-pathname";
import { useMotionOn } from "@/components/semantic/use-root-data";

/**
 * Where `animation-timeline: view()` is missing, section titles below the
 * fold still snap into register once, on a timer, as they scroll in.
 */
export function SnapInFallback() {
  const pathname = usePublicPathname();
  const motion = useMotionOn();

  React.useEffect(() => {
    if (!motion || CSS.supports("animation-timeline: view()")) return;
    const stops = Array.from(document.querySelectorAll<HTMLElement>(".snap-in"))
      .filter(belowFold)
      .map((el) =>
        observeOnce(el, () => {
          el.dataset.snap = "";
        })
      );
    return () => stops.forEach((stop) => stop());
  }, [pathname, motion]);

  return null;
}
