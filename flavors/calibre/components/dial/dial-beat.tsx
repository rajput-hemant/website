"use client";

import * as React from "react";
import {
  BEAT_MS,
  hourAngle,
  onHour,
  same,
  secondsAngle,
  stepTowards,
  tickBeat,
} from "@/flavors/calibre/lib/beat";

import { useMotionOn } from "@/components/semantic/use-root-data";

/** How long the escapement runs after it is woken, ms. */
const AWAKE_MS = 4000;

/**
 * Drives the bezel's rim index, one step per beat. At rest it runs as a
 * seconds hand showing the real second; asked for an hour (a nav item is
 * pointed at) it jumps an hour per beat to that page's mark. It runs in
 * bursts: after arrival, while the pointer is on the dial, and while an
 * hour is asked for, then settles, so an idle page renders nothing. With
 * motion off the index never runs; it only jumps to an asked-for hour.
 */
export function DialBeat() {
  const ref = React.useRef<HTMLSpanElement>(null);
  const motion = useMotionOn();

  React.useEffect(() => {
    const bezel = ref.current?.closest<HTMLElement>("[data-bezel]");
    const hand = bezel?.querySelector<SVGGElement>("[data-rim-index]");
    if (!bezel || !hand) return;

    let angle = secondsAngle(Date.now());
    let target: number | null = null;
    let until = motion ? performance.now() + AWAKE_MS : 0;
    let timer: number | undefined;
    let count = 0;

    const paint = () => hand.style.setProperty("--index", `${angle}deg`);

    const step = () => {
      timer = undefined;
      const goal = target ?? secondsAngle(Date.now());
      angle = stepTowards(angle, goal);
      paint();
      tickBeat(++count);
      const reached = same(angle, goal);
      if (performance.now() < until || !reached) {
        timer = window.setTimeout(step, BEAT_MS);
      }
    };

    const wake = (ms: number) => {
      if (!motion) return;
      until = Math.max(until, performance.now() + ms);
      if (timer === undefined) timer = window.setTimeout(step, BEAT_MS);
    };

    paint();
    if (motion) timer = window.setTimeout(step, BEAT_MS);

    const offHour = onHour((hour) => {
      target = hour === null ? null : hourAngle(hour);
      if (motion) {
        wake(BEAT_MS * 2);
      } else if (target !== null) {
        angle = target;
        paint();
      } else {
        angle = secondsAngle(Date.now());
        paint();
      }
    });
    const onMove = () => wake(1200);
    bezel.addEventListener("pointermove", onMove);
    return () => {
      window.clearTimeout(timer);
      offHour();
      bezel.removeEventListener("pointermove", onMove);
    };
  }, [motion]);

  return <span ref={ref} hidden />;
}
