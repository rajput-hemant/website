"use client";

import * as React from "react";

import { belowFold, observeOnce } from "@/lib/motion/entrance";
import { usePublicPathname } from "@/lib/public-pathname";

/**
 * The contact sheet's two behaviours, after idle. Frames below the fold wait
 * as blank paper and develop as they scroll in (frames already on screen
 * were never hidden). And a row in a list that names a frame with
 * `data-marks` draws the grease ring on that frame while it is pointed at
 * or focused.
 */
export function SheetLayer() {
  const pathname = usePublicPathname();

  React.useEffect(() => {
    const stops = Array.from(
      document.querySelectorAll<HTMLElement>("[data-develops]")
    )
      .filter(belowFold)
      .map((el) => {
        el.dataset.latent = "";
        el.dataset.develop = "";
        return observeOnce(
          el,
          () => {
            delete el.dataset.latent;
          },
          "0px 0px -10% 0px"
        );
      });
    return () => stops.forEach((stop) => stop());
  }, [pathname]);

  React.useEffect(() => {
    const target = (event: Event) => {
      const row =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-marks]")
          : null;
      const id = row?.dataset.marks;
      return row && id ? { row, frame: document.getElementById(id) } : null;
    };
    const on = (event: Event) => {
      const hit = target(event);
      if (hit?.frame) hit.frame.dataset.mark = "";
    };
    const off = (event: PointerEvent | FocusEvent) => {
      const hit = target(event);
      if (!hit?.frame) return;
      if (
        event.relatedTarget instanceof Node &&
        hit.row.contains(event.relatedTarget)
      )
        return;
      delete hit.frame.dataset.mark;
    };
    document.addEventListener("pointerover", on);
    document.addEventListener("focusin", on);
    document.addEventListener("pointerout", off);
    document.addEventListener("focusout", off);
    return () => {
      document.removeEventListener("pointerover", on);
      document.removeEventListener("focusin", on);
      document.removeEventListener("pointerout", off);
      document.removeEventListener("focusout", off);
    };
  }, []);

  return null;
}
