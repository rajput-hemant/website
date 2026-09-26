"use client";

import * as React from "react";

export type CursorApi = {
  move: (x: number, y: number) => void;
  hover: (target: Element | null) => void;
  hide: () => void;
};

const INTERACTIVE =
  "a[href], button, [role=button], label, summary, [data-cursor]";

/** What the tag says over an element: its own `data-cursor`, else what a click does. */
function labelFor(target: Element | null): string | null {
  const el = target?.closest<HTMLElement>(INTERACTIVE);
  if (!el) return null;
  if (el.dataset.cursor) return el.dataset.cursor;
  if (el instanceof HTMLAnchorElement) {
    return el.host && el.host !== location.host ? "Visit" : "Open";
  }
  return "";
}

/**
 * A surveyor's reticle follows a fine pointer: a small cross in a ring that
 * closes around links and opens a tag naming what a click does. It sits
 * beside the native cursor, never replaces it, so focus rings and text
 * selection are untouched. Over the map (`data-cursor="none"`) the loupe is
 * the cursor, so the reticle steps aside. With motion off it jumps.
 */
export const Cursor = React.forwardRef<CursorApi>(function Cursor(_, ref) {
  const root = React.useRef<HTMLDivElement>(null);
  const tag = React.useRef<HTMLSpanElement>(null);

  React.useImperativeHandle(ref, () => {
    const target = { x: -100, y: -100 };
    const at = { x: -100, y: -100 };
    let frame = 0;
    let shown = false;

    const draw = () => {
      const k = document.documentElement.dataset.motion === "on" ? 0.3 : 1;
      at.x += (target.x - at.x) * k;
      at.y += (target.y - at.y) * k;
      if (root.current) {
        root.current.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
      }
      const done =
        Math.abs(target.x - at.x) < 0.2 && Math.abs(target.y - at.y) < 0.2;
      frame = done ? 0 : requestAnimationFrame(draw);
    };

    return {
      move(x, y) {
        target.x = x;
        target.y = y;
        if (!shown && root.current) {
          shown = true;
          at.x = x;
          at.y = y;
          root.current.dataset.shown = "";
        }
        frame ||= requestAnimationFrame(draw);
      },
      hover(el) {
        const node = root.current;
        if (!node || !tag.current) return;
        const label = labelFor(el);
        node.toggleAttribute("data-away", label === "none");
        if (label === null || label === "none") {
          delete node.dataset.over;
          delete node.dataset.label;
          return;
        }
        node.dataset.over = "";
        tag.current.textContent = label;
        node.toggleAttribute("data-label", label !== "");
      },
      hide() {
        shown = false;
        if (root.current) delete root.current.dataset.shown;
      },
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="group/cursor pointer-events-none fixed top-0 left-0 z-[300] hidden opacity-0 transition-opacity duration-150 data-away:opacity-0! data-shown:opacity-100 fine:block"
    >
      <svg
        viewBox="0 0 28 28"
        className="absolute -top-3.5 -left-3.5 size-7 text-water transition-transform duration-200 ease-enter group-data-over/cursor:scale-[0.72]"
      >
        <circle
          cx="14"
          cy="14"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M14 1v7M14 20v7M1 14h7M20 14h7"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
      <span
        ref={tag}
        className="caps absolute top-4 left-4 origin-top-left scale-95 bg-ink px-1.5 py-1 text-[0.625rem] whitespace-nowrap text-sheet opacity-0 transition-[opacity,scale] duration-150 ease-enter group-data-label/cursor:scale-100 group-data-label/cursor:opacity-100"
      />
    </div>
  );
});
