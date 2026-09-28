"use client";

import * as React from "react";
import {
  raises,
  readout,
  sameFocus,
  sceneId,
  type DraftSummary,
  type Focus,
} from "@/flavors/jacquard/lib/focus";

import { clearHovered, setHovered } from "@/lib/scene/store";

const SOURCE = "[data-weave-pick], [data-weave-end]";
const SHUTTLE_MS = 280;

const num = (value: string | undefined) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : -1;
};

function focusOf(el: Element | null): Focus {
  const source = el?.closest<HTMLElement>(SOURCE);
  if (!source) return null;
  const pick = num(source.dataset.weavePick);
  if (pick >= 0) return { type: "pick", i: pick };
  const end = num(source.dataset.weaveEnd);
  return end >= 0 ? { type: "end", i: end } : null;
}

/**
 * The page script for the draft and the swatches (no markup of its own).
 * Pointing at a pick or a thread, in the draft or on a swatch's materials,
 * re-weaves the drawdown around it: its ends take their yarn, shared ends
 * light in other picks, a shuttle crosses the row, and the cloth re-dyes.
 * Clicking a pick keeps it in focus. Keyboard focus does the same without
 * the shuttle.
 */
export function WeaveFocus({ summary }: { summary: DraftSummary }) {
  React.useEffect(() => {
    let current: Focus = null;
    let pinned: Focus = null;

    const apply = (next: Focus, pointer: boolean) => {
      if (sameFocus(current, next)) return;
      const previous = sceneId(current);
      current = next;
      const pick = next?.type === "pick" ? next.i : -1;
      const end = next?.type === "end" ? next.i : -1;

      for (const draft of document.querySelectorAll<HTMLElement>(".draft")) {
        draft.toggleAttribute("data-focus", !!next);
        for (const el of draft.querySelectorAll<SVGElement>("[data-e]")) {
          const e = num(el.dataset.e);
          const p = num(el.dataset.p);
          const up = raises(summary, next, e);
          if (el.classList.contains("cell")) {
            el.classList.toggle("on", pick >= 0 ? p === pick : e === end);
            el.classList.toggle("rel", pick >= 0 && p !== pick && up);
          } else {
            el.classList.toggle("on", up);
          }
        }
        for (const row of draft.querySelectorAll<SVGElement>(".row")) {
          row.classList.toggle("on", num(row.dataset.p) === pick);
        }
        for (const button of draft.querySelectorAll<HTMLElement>(
          "[data-weave-pick]"
        )) {
          const j = num(button.dataset.weavePick);
          const on =
            j === pick ||
            (end >= 0 && (summary.picks[j]?.ends.includes(end) ?? false));
          button.toggleAttribute("data-on", on);
          button.setAttribute(
            "aria-pressed",
            String(pinned?.type === "pick" && pinned.i === j)
          );
        }
        const line = draft.querySelector<HTMLElement>("[data-draft-readout]");
        if (line)
          line.textContent = readout(summary, next) ?? line.dataset.rest ?? "";

        const shuttle = draft.querySelector<SVGRectElement>(".shuttle");
        if (
          shuttle &&
          pointer &&
          pick >= 0 &&
          document.documentElement.dataset.motion === "on"
        ) {
          shuttle.setAttribute(
            "y",
            String(Number(shuttle.dataset.top) + pick + 0.35)
          );
          shuttle.animate(
            [
              { transform: "translateX(0)", opacity: 1 },
              {
                transform: `translateX(${summary.ends.length + 2}px)`,
                opacity: 1,
              },
            ],
            { duration: SHUTTLE_MS, easing: "cubic-bezier(0.6, 0, 0.25, 1)" }
          );
        }
      }

      for (const swatch of document.querySelectorAll<HTMLElement>(".swatch")) {
        const has = end >= 0 && !!swatch.querySelector(`.end[data-e="${end}"]`);
        swatch.toggleAttribute("data-focus", has);
        for (const path of swatch.querySelectorAll<SVGElement>(".end")) {
          path.classList.toggle("on", has && num(path.dataset.e) === end);
        }
      }

      const id = sceneId(next);
      if (id) setHovered(id);
      else if (previous) clearHovered(previous);
    };

    const over = (event: Event) => {
      const next = focusOf(
        event.target instanceof Element ? event.target : null
      );
      if (next) apply(next, event.type === "pointerover");
    };
    const out = (event: PointerEvent | FocusEvent) => {
      const from =
        event.target instanceof Element ? event.target.closest(SOURCE) : null;
      if (!from) return;
      if (
        event.relatedTarget instanceof Node &&
        from.contains(event.relatedTarget)
      )
        return;
      apply(
        focusOf(
          event.relatedTarget instanceof Element ? event.relatedTarget : null
        ) ?? pinned,
        false
      );
    };
    const click = (event: MouseEvent) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("button[data-weave-pick]")
          : null;
      if (!button) return;
      const next = focusOf(button);
      pinned = sameFocus(pinned, next) ? null : next;
      current = null;
      apply(pinned ?? next, false);
    };
    const move = (event: PointerEvent) => {
      const grid =
        event.target instanceof Element
          ? event.target.closest<SVGSVGElement>("[data-draft-grid]")
          : null;
      if (!grid) return;
      const r = grid.getBoundingClientRect();
      const cols = num(grid.dataset.cols);
      const rows = num(grid.dataset.rows);
      const top = num(grid.dataset.picksAt);
      const x = Math.min(
        cols - 1,
        Math.max(0, Math.floor(((event.clientX - r.left) / r.width) * cols))
      );
      const y = Math.floor(((event.clientY - r.top) / r.height) * rows);
      if (y >= 1 && y <= 5) apply({ type: "end", i: x }, true);
      else if (y >= top && y < top + summary.picks.length)
        apply({ type: "pick", i: y - top }, true);
    };
    const leave = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.matches("[data-draft-grid]")
      ) {
        apply(pinned, false);
      }
    };

    document.addEventListener("pointerover", over);
    document.addEventListener("focusin", over);
    document.addEventListener("pointerout", out);
    document.addEventListener("focusout", out);
    document.addEventListener("click", click);
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerdown", move);
    document.addEventListener("pointerleave", leave, true);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("focusin", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("focusout", out);
      document.removeEventListener("click", click);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", move);
      document.removeEventListener("pointerleave", leave, true);
      const id = sceneId(current);
      if (id) clearHovered(id);
    };
  }, [summary]);

  return null;
}
