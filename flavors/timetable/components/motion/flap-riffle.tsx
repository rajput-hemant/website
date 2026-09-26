"use client";

import * as React from "react";
import { DRUM } from "@/flavors/timetable/lib/board";

const STEP_MS = 46;
const done = new WeakSet<Element>();

function riffle(el: HTMLElement) {
  done.add(el);
  const cells = [...el.children] as HTMLElement[];
  cells.forEach((cell, i) => {
    const final = cell.dataset.c ?? cell.textContent ?? " ";
    if (final === " ") return;
    let left = 4 + i * 2;
    const tick = () => {
      left--;
      cell.textContent =
        left > 0 ? (DRUM[1 + Math.floor(Math.random() * 36)] ?? final) : final;
      cell.style.opacity = left > 0 ? "0.7" : "";
      if (left > 0) setTimeout(tick, STEP_MS);
    };
    tick();
  });
}

/**
 * Turns every `[data-flap]` board through its drum the first time it scrolls
 * into view, and draws a `[data-draw-root]` map's lines in the same way, then
 * leaves them alone. Motion off, nothing moves: everything was already
 * correct from first paint.
 */
export function FlapRiffle() {
  React.useEffect(() => {
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          if (root.dataset.motion === "on") riffle(entry.target as HTMLElement);
        }
      },
      { threshold: 0.9 }
    );
    const draw = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          draw.unobserve(entry.target);
          (entry.target as SVGElement).dataset.draw = "done";
        }
      },
      { threshold: 0.3 }
    );
    const scan = () => {
      for (const el of document.querySelectorAll<HTMLElement>("[data-flap]")) {
        if (!done.has(el)) {
          done.add(el);
          io.observe(el);
        }
      }
      if (root.dataset.motion !== "on") return;
      for (const el of document.querySelectorAll<SVGElement>(
        "[data-draw-root]:not([data-draw])"
      )) {
        // Only maps still below the fold draw in; one already seen stays drawn.
        if (el.getBoundingClientRect().top < innerHeight) continue;
        el.dataset.draw = "pending";
        draw.observe(el);
      }
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      draw.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
