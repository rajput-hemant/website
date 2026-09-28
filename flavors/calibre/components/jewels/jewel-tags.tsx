"use client";

import * as React from "react";
import {
  LAYOUT,
  parseBoard,
  settings,
} from "@/flavors/calibre/lib/scene/poses";
import { layTags, TAG_GAP } from "@/flavors/calibre/lib/tags";

/** A project's name, tagged on its jewel in the movement. */
export type Tag = { n: number; name: string };

/** Where a seat sits in the window, as a share of it: the poster's own layout. */
const share = (v: number) => `${(50 + v * 46).toFixed(2)}%`;

/**
 * Every jewel's project name, in HTML over the movement (never canvas text):
 * placed at the poster's seats, and moved with the jewels by the scene once
 * it is live. A tag reaches in towards the arbor, and steps aside where it
 * would cover another or leave the window (`placeTags`). Pointing at
 * or focusing a jewel card sets its tag in blued steel, as the page's own lit
 * jewel is; the tags themselves are aria-hidden, as the cards carry the names.
 */
export function JewelTags({
  board,
  tags,
}: {
  board: string;
  tags: readonly Tag[];
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { jewels, lit } = parseBoard(board);
  const names = new Map(tags.map((tag) => [tag.n, tag.name]));

  // On the poster, lay the tags out from the seats; once the scene is
  // live it lays them out from the jewels each frame instead.
  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const seats = new Map(settings(jewels).map((seat) => [seat.n, seat]));
    const lay = () => {
      if (root.parentElement?.querySelector("[data-scene-live]")) return;
      const { width, height } = root.getBoundingClientRect();
      layTags(
        root,
        (n) => {
          const seat = seats.get(n);
          return seat
            ? {
                x: (0.5 + seat.x * 0.46) * width,
                y: (0.5 - seat.y * 0.46) * height,
              }
            : null;
        },
        width,
        height
      );
    };
    // Again whenever the window or a tag changes size: the small caps
    // load late and set each tag's width.
    const ro = new ResizeObserver(lay);
    ro.observe(root);
    for (const b of root.querySelectorAll("b")) ro.observe(b);
    return () => ro.disconnect();
  }, [jewels]);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let on: Element | null = null;
    const set = (el: Element | null) => {
      if (el === on) return;
      on?.removeAttribute("data-on");
      el?.setAttribute("data-on", "");
      on = el;
    };
    const tagFor = (target: EventTarget | null) => {
      const card =
        target instanceof Element
          ? target.closest<HTMLElement>('[data-scene-item^="jewel:"]')
          : null;
      const n = card?.dataset.sceneItem?.slice("jewel:".length);
      return n ? root.querySelector(`[data-cb-tag="${CSS.escape(n)}"]`) : null;
    };
    const over = (e: Event) => set(tagFor(e.target));
    const out = (e: PointerEvent | FocusEvent) => {
      if (tagFor(e.relatedTarget) !== on) set(null);
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("focusin", over);
    document.addEventListener("pointerout", out);
    document.addEventListener("focusout", out);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("focusin", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("focusout", out);
      set(null);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10"
    >
      {settings(jewels).map((seat) => {
        const name = names.get(seat.n);
        if (!name) return null;
        // The two pallet stones sit side by side: each reaches out its own way.
        const left = seat.on === "pallet" ? seat.x < LAYOUT.fork.x : seat.x > 0;
        return (
          <span
            key={seat.n}
            data-cb-tag={seat.n}
            data-prefer={left ? "left" : "right"}
            data-lit={seat.n === lit ? "" : undefined}
            style={{
              left: share(seat.x),
              top: share(-seat.y),
              translate: left
                ? `calc(-100% - ${TAG_GAP}px) -50%`
                : `${TAG_GAP}px -50%`,
            }}
            className="absolute whitespace-nowrap"
          >
            <b className="block rounded-full border border-line-strong bg-raise/90 px-1.5 py-px font-spec text-[0.6875rem] leading-[1.3] font-medium tracking-[0.04em] text-ink shadow-[0_2px_6px_-3px_rgb(0_0_0/0.5)] transition-[background-color,color,border-color,scale] duration-(--duration-ui) ease-out [[data-lit]>&]:border-steel [[data-lit]>&]:bg-steel [[data-lit]>&]:text-ground [[data-on]>&]:scale-110 [[data-on]>&]:border-steel [[data-on]>&]:bg-steel [[data-on]>&]:text-ground">
              {name}
            </b>
            <i
              data-leader
              className="absolute top-1/2 h-px origin-left bg-ink/60 [[data-lit]>&]:bg-steel [[data-on]>&]:bg-steel"
              style={{
                left: left ? "100%" : "0",
                width: TAG_GAP,
                rotate: left ? "0rad" : `${Math.PI}rad`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
