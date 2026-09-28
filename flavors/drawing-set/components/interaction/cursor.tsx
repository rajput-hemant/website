"use client";

import * as React from "react";
import {
  GRID_COLUMNS,
  GRID_ROWS,
} from "@/flavors/drawing-set/components/site/drawing-frame";

import { useFinePointer } from "@/components/semantic/use-media-query";
import { useMotionOn, useRootData } from "@/components/semantic/use-root-data";

import "./cursor.css";

export type CursorApi = {
  move(x: number, y: number): void;
  hover(target: Element | null): void;
  hide(): void;
};

const HOT_SELECTOR = "a, button, [role=button], summary, label";
/** Text inputs keep the native caret, so the reticle gets out of the way. */
const CARET_SELECTOR =
  "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]), textarea, [contenteditable='true']";

/** The frame's grid reference under a point: the same geometry as DrawingFrame's ticks. */
function gridRef(x: number, y: number): string {
  const inset = window.innerWidth < 768 ? 8 : 12;
  const band = window.innerWidth < 768 ? 0 : 14;
  const pick = (list: string[], value: number, size: number) => {
    const span = size - inset * 2 - band;
    const index = Math.floor(((value - inset - band) / span) * list.length);
    return list[Math.min(list.length - 1, Math.max(0, index))];
  };
  return `${pick(GRID_COLUMNS, x, window.innerWidth)}${pick(GRID_ROWS, y, window.innerHeight)}`;
}

/**
 * A redline crosshair with a mono readout of the grid reference under it
 * (`C4`), or the `data-cursor` label over labelled targets. Fine pointers
 * with motion on only; renders nothing otherwise.
 */
export function Cursor({ ref }: { ref?: React.Ref<CursorApi> }) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const readoutRef = React.useRef<HTMLSpanElement>(null);
  const labelledRef = React.useRef(false);

  const fine = useFinePointer();
  const motion = useMotionOn();
  const pref = useRootData("cursor", "on") === "on";
  const active = fine && motion && pref;

  React.useEffect(() => {
    document.documentElement.classList.toggle("cursor-none", active);
    return () => document.documentElement.classList.remove("cursor-none");
  }, [active]);

  React.useImperativeHandle(
    ref,
    () => ({
      move(x, y) {
        const root = rootRef.current;
        if (!root) return;
        root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        root.style.opacity = "1";
        if (!labelledRef.current && readoutRef.current) {
          readoutRef.current.textContent = gridRef(x, y);
        }
      },
      hover(target) {
        const root = rootRef.current;
        const readout = readoutRef.current;
        if (!root || !readout) return;
        // `body` scopes out <html data-cursor>, which is the preference flag.
        const labelled = target?.closest<HTMLElement>("body [data-cursor]");
        labelledRef.current = Boolean(labelled?.dataset.cursor);
        if (labelled?.dataset.cursor)
          readout.textContent = labelled.dataset.cursor;
        root.dataset.state = target?.closest(CARET_SELECTOR)
          ? "hidden"
          : labelledRef.current || target?.closest(HOT_SELECTOR)
            ? "hot"
            : "idle";
      },
      hide() {
        if (rootRef.current) rootRef.current.style.opacity = "0";
      },
    }),
    []
  );

  if (!active) return null;

  return (
    <div ref={rootRef} aria-hidden data-state="idle" className="cursor-root">
      <svg className="cursor-reticle" viewBox="-12 -12 24 24">
        <path d="M-11 0h7M4 0h7M0-11v7M0 4v7" />
        <circle r="1" />
      </svg>
      <span ref={readoutRef} className="cursor-readout" />
    </div>
  );
}
