"use client";

import * as React from "react";
import { knobStore, shownIndex } from "@/flavors/surface/lib/knob/store";
import { knobSounds } from "@/flavors/surface/lib/sound/detents";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

/** The printed reels: two windowed flanges and the tape between them. */
function ReelsPoster() {
  const reel = (cx: number) => (
    <g transform={`translate(${cx} 30)`}>
      <circle r="27" className="fill-ink-3" />
      {[0, 120, 240].map((a) => (
        <path
          key={a}
          transform={`rotate(${a + 20})`}
          d="M0 -8 L0 -23 A23 23 0 0 1 19.9 -11.5 L6.9 -4 A8 8 0 0 0 0 -8Z"
          className="fill-plate-lo"
        />
      ))}
      <circle r="6" className="fill-ink" />
    </g>
  );
  return (
    <svg
      viewBox="0 0 136 60"
      data-bench-poster
      className="absolute inset-0 size-full"
    >
      <line x1="31" y1="54" x2="105" y2="56" className="stroke-ink" />
      {reel(31)}
      {reel(105)}
    </svg>
  );
}

/**
 * The tape reels beside the multitrack. `stops[i]` is how far through the
 * tape role i ends; `rest` is today. On `/` pointing at a track
 * (`data-track`) winds to it. On `/work` the knob's track drives them, and
 * dragging the reels sideways scrubs the knob, a second way to turn it.
 */
export function TapeReels({
  stops,
  rest,
  follow,
  className,
}: {
  stops: readonly number[];
  rest: number;
  /** `hover`: tracks wind it on hover. `knob`: the knob's detent does, and a drag scrubs it. */
  follow: "hover" | "knob";
  className?: string;
}) {
  const wound = () =>
    follow === "knob"
      ? (stops[shownIndex(knobStore.getState())] ?? rest)
      : rest;
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/reels").then((m) =>
      m.attachReels(host, options, wound())
    )
  );

  React.useEffect(() => {
    if (follow === "knob") {
      return knobStore.subscribe((state) =>
        handle.current?.wind(stops[shownIndex(state)] ?? rest)
      );
    }
    const trackOf = (target: EventTarget | null) => {
      const el = target instanceof Element && target.closest("[data-track]");
      const n = el ? Number(el.getAttribute("data-track")) : NaN;
      return Number.isInteger(n) ? n : null;
    };
    const over = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const n = trackOf(event.target);
      if (n !== null) handle.current?.wind(stops[n] ?? rest);
    };
    const out = (event: PointerEvent) => {
      if (
        trackOf(event.target) !== null &&
        trackOf(event.relatedTarget) === null
      )
        handle.current?.wind(rest);
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
    };
  }, [follow, handle, rest, stops]);

  // A sideways drag scrubs the knob: the full width of the reels is the whole tape.
  const scrub = React.useRef<{ id: number; x: number; from: number } | null>(
    null
  );
  const nearest = (f: number) => {
    let best = 0;
    stops.forEach((stop, i) => {
      if (Math.abs(stop - f) < Math.abs((stops[best] ?? 0) - f)) best = i;
    });
    return best;
  };

  return (
    <span
      ref={rootRef}
      aria-hidden
      data-cursor={follow === "knob" ? "Turn" : undefined}
      onPointerDown={(event) => {
        if (follow !== "knob" || event.button !== 0 || !handle.current) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const i = knobStore.getState().index;
        scrub.current = {
          id: event.pointerId,
          x: event.clientX,
          from: stops[i] ?? rest,
        };
      }}
      onPointerMove={(event) => {
        const s = scrub.current;
        if (!s || s.id !== event.pointerId) return;
        const width = event.currentTarget.clientWidth || 1;
        const n = nearest(s.from + (event.clientX - s.x) / width);
        if (n === knobStore.getState().index) return;
        knobSounds.detent(n, stops.length);
        knobStore.setState({ index: n, preview: null });
      }}
      onPointerUp={(event) => {
        if (scrub.current?.id !== event.pointerId) return;
        scrub.current = null;
        document
          .querySelector(`[data-knob-item="${knobStore.getState().index}"]`)
          ?.scrollIntoView({
            block: "center",
            behavior:
              document.documentElement.dataset.motion === "on"
                ? "smooth"
                : "auto",
          });
      }}
      onPointerCancel={() => {
        scrub.current = null;
      }}
      className={cn(
        "relative block h-[60px] w-[136px] shrink-0 select-none",
        follow === "knob" && "cursor-ew-resize touch-pan-y",
        className
      )}
    >
      <ReelsPoster />
      <span
        ref={hostRef}
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
    </span>
  );
}
