"use client";

import * as React from "react";
import { canPlayScene } from "@/flavors/timetable/lib/sound/voices";

import { riffle } from "./riffle";

const done = new WeakSet<Element>();
/** The page whose first audible riffle already fluttered; later ones stay quiet. */
let heardOn: string | null = null;

/** Every element matching `selector` at or inside the added nodes. */
function* added(records: MutationRecord[], selector: string) {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches(selector)) yield node;
      yield* node.querySelectorAll(selector);
    }
  }
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
          if (root.dataset.motion !== "on") continue;
          // The first riffle on each page flutters at half gain, if heard.
          const audible = heardOn !== location.pathname && canPlayScene();
          if (audible) heardOn = location.pathname;
          const board = entry.target;
          if (!(board instanceof HTMLElement)) continue;
          const max = Number(board.dataset.riffleMax) || undefined;
          riffle(board, {
            ...(max ? { max } : {}),
            ...(audible ? { gain: 0.5 } : {}),
          });
        }
      },
      { threshold: 0.9 }
    );
    const draw = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          draw.unobserve(entry.target);
          if (entry.target instanceof SVGElement) {
            entry.target.dataset.draw = "done";
          }
        }
      },
      { threshold: 0.3 }
    );
    const boards = (els: Iterable<Element>) => {
      for (const el of els) {
        if (done.has(el)) continue;
        done.add(el);
        io.observe(el);
      }
    };
    const maps = (els: Iterable<Element>) => {
      if (root.dataset.motion !== "on") return;
      for (const el of els) {
        if (!(el instanceof SVGElement) || el.dataset.draw) continue;
        // Only maps still below the fold draw in; one already seen stays drawn.
        if (el.getBoundingClientRect().top < innerHeight) continue;
        el.dataset.draw = "pending";
        draw.observe(el);
      }
    };
    boards(document.querySelectorAll("[data-flap]"));
    maps(document.querySelectorAll("[data-draw-root]"));
    // Only what a mutation added is new; the rest of the page was seen.
    const mo = new MutationObserver((records) => {
      boards(added(records, "[data-flap]"));
      maps(added(records, "[data-draw-root]"));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      draw.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
