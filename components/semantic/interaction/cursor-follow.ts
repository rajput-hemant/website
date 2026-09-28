"use client";

import * as React from "react";

const INTERACTIVE =
  "a[href], button, [role=button], label, summary, [data-cursor]";

/**
 * What a cursor tag should say over `target`: the element's own
 * `data-cursor`, "Visit" for a link off the site, `fallback` for any other
 * link, "" for another control, and `null` over nothing interactive.
 */
export function cursorLabel(
  target: Element | null,
  fallback = "Open"
): string | null {
  const el = target?.closest<HTMLElement>(INTERACTIVE);
  if (!el) return null;
  if (el.dataset.cursor) return el.dataset.cursor;
  if (el instanceof HTMLAnchorElement) {
    return el.host && el.host !== location.host ? "Visit" : fallback;
  }
  return "";
}

/**
 * Moves the element in `ref` after the pointer: it eases a share `ease` of
 * the way each frame, jumps with motion off, and only runs frames while it
 * is catching up. The pending frame is cancelled on unmount. The edition
 * draws the cursor and decides what it shows.
 */
export function useCursorFollow<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  ease = 0.3
) {
  const [follow] = React.useState(() => {
    const target = { x: -100, y: -100 };
    const at = { x: -100, y: -100 };
    let frame = 0;
    let shown = false;

    const draw = () => {
      const k = document.documentElement.dataset.motion === "on" ? ease : 1;
      at.x += (target.x - at.x) * k;
      at.y += (target.y - at.y) * k;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
      }
      const done =
        Math.abs(target.x - at.x) < 0.2 && Math.abs(target.y - at.y) < 0.2;
      frame = done ? 0 : requestAnimationFrame(draw);
    };

    return {
      move(x: number, y: number) {
        target.x = x;
        target.y = y;
        if (!shown && ref.current) {
          shown = true;
          at.x = x;
          at.y = y;
          ref.current.dataset.shown = "";
        }
        frame ||= requestAnimationFrame(draw);
      },
      hide() {
        shown = false;
        if (ref.current) delete ref.current.dataset.shown;
      },
      stop() {
        cancelAnimationFrame(frame);
        frame = 0;
      },
    };
  });

  React.useEffect(() => follow.stop, [follow]);
  return follow;
}
