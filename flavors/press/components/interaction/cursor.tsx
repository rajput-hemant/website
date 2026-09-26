"use client";

import * as React from "react";

import { cursorLabel } from "@/components/semantic/interaction/cursor-follow";

export type CursorApi = {
  move: (x: number, y: number) => void;
  hover: (target: Element | null) => void;
  hide: () => void;
};

/** How fast each plate catches up: blue leads, pink and yellow trail. */
const PLATES = [0.34, 0.2, 0.13] as const;

/**
 * A registration target that follows a fine pointer beside the native
 * cursor. Moving spreads its three plates out of register, since each one
 * catches up at its own rate; over a link they lock together and a slug
 * names what a click does. With motion off it jumps and never spreads.
 */
export const Cursor = React.forwardRef<CursorApi>(function Cursor(_, ref) {
  const root = React.useRef<HTMLDivElement>(null);
  const plates = React.useRef<(HTMLSpanElement | null)[]>([]);
  const labelAt = React.useRef<HTMLSpanElement>(null);
  const label = React.useRef<HTMLSpanElement>(null);

  React.useImperativeHandle(ref, () => {
    const target = { x: -100, y: -100 };
    const at = PLATES.map(() => ({ x: -100, y: -100 }));
    let frame = 0;
    let locked = false;

    const draw = () => {
      const snap = document.documentElement.dataset.motion !== "on";
      let moving = false;
      at.forEach((p, i) => {
        const k = snap ? 1 : locked ? 0.4 : PLATES[i]!;
        p.x += (target.x - p.x) * k;
        p.y += (target.y - p.y) * k;
        if (
          Math.abs(target.x - p.x) > 0.15 ||
          Math.abs(target.y - p.y) > 0.15
        ) {
          moving = true;
        }
        const el = plates.current[i];
        if (el) el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      });
      if (labelAt.current) {
        labelAt.current.style.transform = `translate3d(${at[0]!.x}px, ${at[0]!.y}px, 0)`;
      }
      frame = moving ? requestAnimationFrame(draw) : 0;
    };

    return {
      move(x, y) {
        target.x = x;
        target.y = y;
        const el = root.current;
        if (el && !("shown" in el.dataset)) {
          for (const p of at) {
            p.x = x;
            p.y = y;
          }
          el.dataset.shown = "";
        }
        frame ||= requestAnimationFrame(draw);
      },
      hover(el) {
        const text = cursorLabel(el);
        const node = root.current;
        if (!node || !label.current) return;
        locked = text !== null;
        node.toggleAttribute("data-over", locked);
        if (text) label.current.textContent = text;
        node.toggleAttribute("data-label", !!text);
        frame ||= requestAnimationFrame(draw);
      },
      hide() {
        delete root.current?.dataset.shown;
      },
    };
  }, []);

  const plate =
    "absolute top-0 left-0 -mt-[9px] -ml-[9px] size-[18px] rounded-full border-[1.5px] border-current blend transition-[scale] duration-200 ease-enter group-data-over/cursor:scale-[0.7] before:absolute before:top-1/2 before:-right-[5px] before:-left-[5px] before:h-px before:bg-current after:absolute after:-top-[5px] after:-bottom-[5px] after:left-1/2 after:w-px after:bg-current";

  return (
    <div
      ref={root}
      aria-hidden
      className="group/cursor pointer-events-none fixed top-0 left-0 z-[300] hidden opacity-0 transition-opacity duration-150 data-shown:opacity-100 fine:block"
    >
      {(["text-blue", "text-pink", "text-yellow"] as const).map((color, i) => (
        <span
          key={color}
          ref={(el) => {
            plates.current[i] = el;
          }}
          className={`${plate} ${color}`}
        />
      ))}
      <span ref={labelAt} className="absolute top-0 left-0">
        <span
          ref={label}
          className="absolute top-4 left-4 block origin-top-left scale-90 bg-ink px-1.5 py-1 slug leading-none whitespace-nowrap text-paper opacity-0 transition-[opacity,scale] duration-150 ease-enter group-data-label/cursor:scale-100 group-data-label/cursor:opacity-100"
        />
      </span>
    </div>
  );
});
