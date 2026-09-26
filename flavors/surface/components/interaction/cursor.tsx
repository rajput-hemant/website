"use client";

import * as React from "react";

import {
  cursorLabel,
  useCursorFollow,
} from "@/components/semantic/interaction/cursor-follow";
import { usePointerTracking } from "@/components/semantic/interaction/use-pointer-tracking";
import { useFinePointer } from "@/components/semantic/use-media-query";

const CARET =
  "input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select, [contenteditable='true']";

/**
 * A probe that follows a fine pointer beside the native cursor: a scale ring
 * with four index ticks and a signal-yellow pip. Over a control the ring
 * turns a detent and closes in, and an engraved legend names what a click
 * does. It steps aside over text fields and jumps with motion off.
 */
export function Cursor() {
  const fine = useFinePointer();
  return fine ? <Probe /> : null;
}

function Probe() {
  const root = React.useRef<HTMLDivElement>(null);
  const tag = React.useRef<HTMLSpanElement>(null);
  const follow = useCursorFollow(root, 0.35);

  usePointerTracking({
    onMove: follow.move,
    onLeave: follow.hide,
    onHover(el) {
      const node = root.current;
      if (!node || !tag.current) return;
      node.toggleAttribute("data-away", Boolean(el?.closest(CARET)));
      const label = cursorLabel(el);
      node.toggleAttribute("data-over", label !== null);
      if (label) tag.current.textContent = label;
      node.toggleAttribute("data-label", Boolean(label));
    },
  });

  return (
    <div
      ref={root}
      aria-hidden
      className="group/cursor pointer-events-none fixed top-0 left-0 z-[300] opacity-0 transition-opacity duration-150 data-away:opacity-0! data-shown:opacity-100"
    >
      <svg
        viewBox="0 0 28 28"
        className="absolute -top-3.5 -left-3.5 size-7 text-ink transition-transform duration-200 ease-(--ease-detent) group-data-over/cursor:scale-75 group-data-over/cursor:rotate-45"
      >
        <circle
          cx="14"
          cy="14"
          r="8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="M14 1v4M14 23v4M1 14h4M23 14h4"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <circle cx="14" cy="14" r="2" className="fill-signal" />
      </svg>
      <span
        ref={tag}
        className="legend absolute top-4 left-4 origin-top-left scale-95 rounded-[3px] bg-plate-2 px-1.5 py-1 whitespace-nowrap text-ink opacity-0 shadow-[0_0_0_1px_var(--color-seam)] transition-[opacity,scale] duration-150 ease-(--ease-out) group-data-label/cursor:scale-100 group-data-label/cursor:opacity-100"
      />
    </div>
  );
}
