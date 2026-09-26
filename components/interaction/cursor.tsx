"use client";

import * as React from "react";

import { gsap } from "@/lib/motion/gsap";
import { useMotionOn, useRootData } from "@/lib/motion/use-root-data";

import "./cursor.css";

export type CursorApi = {
  move(x: number, y: number): void;
  hover(target: Element | null): void;
  hide(): void;
};

/** Grows the ring; the label element only shows text over `[data-cursor]`. */
const GROW_SELECTOR = "a, button, [role=button], summary, label";
/** Text inputs keep the native caret, so the custom cursor gets out of the way. */
const CARET_SELECTOR =
  "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]), textarea, [contenteditable='true']";

type RingState = "default" | "grow" | "label" | "hidden";

/**
 * Dot + ring pointer follower, `hover:hover and pointer:fine` only, and only
 * when the visitor hasn't turned it off. Renders nothing otherwise, so touch
 * and cursor-off visitors pay nothing for it.
 */
export function Cursor({ ref }: { ref?: React.Ref<CursorApi> }) {
  const dotRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const shownRef = React.useRef(false);
  const tweensRef = React.useRef<{
    dotX: gsap.QuickToFunc;
    dotY: gsap.QuickToFunc;
    ringX?: gsap.QuickToFunc;
    ringY?: gsap.QuickToFunc;
  } | null>(null);

  const cursorPref = useRootData("cursor", "on") === "on";
  const motion = useMotionOn();
  const [finePointer, setFinePointer] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const active = finePointer && cursorPref;

  React.useEffect(() => {
    document.documentElement.classList.toggle("cursor-none", active);
    return () => document.documentElement.classList.remove("cursor-none");
  }, [active]);

  React.useEffect(() => {
    if (!active || !dotRef.current) return;
    // Motion off: dot only, duration 0 (no lag). The ring isn't rendered at all.
    const dotDuration = motion ? 0.12 : 0;
    tweensRef.current = {
      dotX: gsap.quickTo(dotRef.current, "x", {
        duration: dotDuration,
        ease: "enter",
      }),
      dotY: gsap.quickTo(dotRef.current, "y", {
        duration: dotDuration,
        ease: "enter",
      }),
      ...(motion && ringRef.current
        ? {
            ringX: gsap.quickTo(ringRef.current, "x", {
              duration: 0.4,
              ease: "glide",
            }),
            ringY: gsap.quickTo(ringRef.current, "y", {
              duration: 0.4,
              ease: "glide",
            }),
          }
        : {}),
    };
    return () => {
      tweensRef.current = null;
    };
  }, [active, motion]);

  React.useImperativeHandle(
    ref,
    () => ({
      move(x, y) {
        const tweens = tweensRef.current;
        if (!tweens) return;
        if (!shownRef.current) {
          shownRef.current = true;
          if (rootRef.current) rootRef.current.style.opacity = "1";
        }
        tweens.dotX(x);
        tweens.dotY(y);
        tweens.ringX?.(x);
        tweens.ringY?.(y);
      },
      hover(target) {
        const ring = ringRef.current;
        const label = labelRef.current;
        if (!ring || !label) return;

        let state: RingState = "default";
        let text = "";
        if (target?.closest(CARET_SELECTOR)) {
          state = "hidden";
        } else {
          const labelled = target?.closest<HTMLElement>("[data-cursor]");
          if (labelled) {
            state = "label";
            text = labelled.dataset.cursor ?? "";
          } else if (target?.closest(GROW_SELECTOR)) {
            state = "grow";
          }
        }
        ring.dataset.state = state;
        label.textContent = text;
      },
      hide() {
        shownRef.current = false;
        if (rootRef.current) rootRef.current.style.opacity = "0";
      },
    }),
    []
  );

  if (!active) return null;

  return (
    <div ref={rootRef} aria-hidden className="cursor-root">
      <div ref={dotRef} className="cursor-dot" />
      {motion && (
        <div ref={ringRef} className="cursor-ring" data-state="default">
          <span ref={labelRef} className="cursor-label" />
        </div>
      )}
    </div>
  );
}
