"use client";

import * as React from "react";

export type CursorApi = {
  move: (x: number, y: number) => void;
  hover: (target: Element | null) => void;
  hide: () => void;
};

const INTERACTIVE =
  "a[href], button, [role=button], label, summary, [data-cursor]";

/** What the plate says over an element: its own `data-cursor`, else what a click does there. */
function labelFor(target: Element | null): string | null {
  const el = target?.closest<HTMLElement>(INTERACTIVE);
  if (!el) return null;
  if (el.dataset.cursor) return el.dataset.cursor;
  if (el instanceof HTMLAnchorElement) {
    return el.host && el.host !== location.host ? "Visit" : "Go";
  }
  return "";
}

/**
 * The "you are here" marker follows a fine pointer: a signal-yellow dot that
 * opens into a small sign plate naming what a click does. It sits beside the
 * native cursor, never replaces it, so focus rings and text selection are
 * untouched. It only animates while it catches up; with motion off it jumps.
 */
export const Cursor = React.forwardRef<CursorApi>(function Cursor(_, ref) {
  const dot = React.useRef<HTMLDivElement>(null);
  const plate = React.useRef<HTMLSpanElement>(null);

  React.useImperativeHandle(ref, () => {
    const target = { x: -100, y: -100 };
    const at = { x: -100, y: -100 };
    let frame = 0;
    let shown = false;

    const draw = () => {
      const snap = document.documentElement.dataset.motion !== "on";
      const k = snap ? 1 : 0.32;
      at.x += (target.x - at.x) * k;
      at.y += (target.y - at.y) * k;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
      }
      const done =
        Math.abs(target.x - at.x) < 0.2 && Math.abs(target.y - at.y) < 0.2;
      frame = done ? 0 : requestAnimationFrame(draw);
    };

    return {
      move(x, y) {
        target.x = x;
        target.y = y;
        if (!shown && dot.current) {
          shown = true;
          at.x = x;
          at.y = y;
          dot.current.dataset.shown = "";
        }
        frame ||= requestAnimationFrame(draw);
      },
      hover(el) {
        const label = labelFor(el);
        if (!dot.current || !plate.current) return;
        if (label === null) {
          delete dot.current.dataset.over;
          delete dot.current.dataset.label;
        } else {
          dot.current.dataset.over = "";
          plate.current.textContent = label;
          dot.current.toggleAttribute("data-label", label !== "");
        }
      },
      hide() {
        shown = false;
        if (dot.current) delete dot.current.dataset.shown;
      },
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      className="group/cursor pointer-events-none fixed top-0 left-0 z-[300] hidden opacity-0 transition-opacity duration-150 data-shown:opacity-100 fine:block"
    >
      <span className="absolute -top-[5px] -left-[5px] size-2.5 rounded-full bg-signal shadow-[0_0_0_1.5px_var(--color-signal-ink)] transition-transform duration-200 ease-enter group-data-over/cursor:scale-[0.6]" />
      <span
        ref={plate}
        className="absolute top-5 left-4.5 origin-top-left scale-90 rounded-[3px] bg-sign px-1.5 pt-1 pb-0.5 font-mono text-[0.625rem] leading-none font-bold tracking-[0.08em] whitespace-nowrap text-signal uppercase opacity-0 transition-[opacity,scale] duration-150 ease-enter group-data-label/cursor:scale-100 group-data-label/cursor:opacity-100"
      />
    </div>
  );
});
