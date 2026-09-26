"use client";

import * as React from "react";

import { pointer } from "@/lib/interaction/pointer";
import { gsap, motionOn } from "@/lib/motion/gsap";

import { Cursor, type CursorApi } from "./cursor";

const MAGNET_PULL = 0.32;
const MAGNET_MAX = 10;
const TILT_MAX_DEG = 4;

type Tracked = {
  el: HTMLElement;
  rect: DOMRect;
  kind: "magnetic" | "tilt";
  x?: gsap.QuickToFunc;
  y?: gsap.QuickToFunc;
  innerX?: gsap.QuickToFunc;
  innerY?: gsap.QuickToFunc;
};

/**
 * Site-wide pointer layer: one passive listener feeds the shared `pointer`,
 * the cursor, and delegated effects on `[data-magnetic]` and `[data-tilt]`.
 * Rects are read on enter only; moves just retarget quickTo tweens, so a move
 * costs a few property writes. Keyboard focus gets the same effects in CSS.
 */
export function InteractionLayer() {
  const cursor = React.useRef<CursorApi>(null);

  React.useEffect(() => {
    let tracked: Tracked | null = null;

    const release = () => {
      if (!tracked) return;
      const { el, kind } = tracked;
      if (kind === "magnetic") {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "glide" });
        const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: "glide" });
      } else {
        gsap.to(el, { "--rx": 0, "--ry": 0, duration: 0.6, ease: "glide" });
        el.removeAttribute("data-tilting");
      }
      el.style.willChange = "";
      tracked = null;
    };

    const track = (el: HTMLElement, kind: Tracked["kind"]) => {
      release();
      el.style.willChange = "transform";
      const next: Tracked = { el, kind, rect: el.getBoundingClientRect() };
      const options = { duration: 0.45, ease: "enter" } as const;
      if (kind === "magnetic") {
        next.x = gsap.quickTo(el, "x", options);
        next.y = gsap.quickTo(el, "y", options);
        const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");
        if (inner) {
          next.innerX = gsap.quickTo(inner, "x", options);
          next.innerY = gsap.quickTo(inner, "y", options);
        }
      } else {
        next.x = gsap.quickTo(el, "--ry", options);
        next.y = gsap.quickTo(el, "--rx", options);
        el.setAttribute("data-tilting", "");
      }
      tracked = next;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.nx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = -((event.clientY / window.innerHeight) * 2 - 1);
      pointer.fine = true;
      pointer.movedAt = performance.now();
      cursor.current?.move(event.clientX, event.clientY);

      if (!tracked || !motionOn()) return;
      const { rect, el } = tracked;
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      if (tracked.kind === "magnetic") {
        const clamp = gsap.utils.clamp(-MAGNET_MAX, MAGNET_MAX);
        tracked.x?.(clamp(dx * MAGNET_PULL));
        tracked.y?.(clamp(dy * MAGNET_PULL));
        tracked.innerX?.(clamp(dx * MAGNET_PULL * 0.5));
        tracked.innerY?.(clamp(dy * MAGNET_PULL * 0.5));
      } else {
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        tracked.x?.((px - 0.5) * 2 * TILT_MAX_DEG);
        tracked.y?.(-(py - 0.5) * 2 * TILT_MAX_DEG);
      }
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = event.target as Element | null;
      const el = target?.closest<HTMLElement>("[data-magnetic], [data-tilt]");
      cursor.current?.hover(target);
      if (el === tracked?.el) return;
      if (!el) return release();
      track(el, el.hasAttribute("data-magnetic") ? "magnetic" : "tilt");
    };

    const onLeaveWindow = () => {
      release();
      cursor.current?.hide();
    };

    const onScroll = () => {
      if (tracked) tracked.rect = tracked.el.getBoundingClientRect();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      release();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener(
        "pointerleave",
        onLeaveWindow
      );
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <Cursor ref={cursor} />;
}
