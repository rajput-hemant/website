"use client";

import * as React from "react";
import {
  clock,
  DAY_END,
  DAY_START,
  describeLight,
  lightAt,
  STEP,
  sunPath,
} from "@/flavors/maquette/lib/sun";
import { setSunMinutes, useSunMinutes } from "@/flavors/maquette/lib/sun-store";
import { cn } from "@/flavors/maquette/lib/utils";

import { useMotionOn, useRootData } from "@/components/semantic/use-root-data";

const PATH = sunPath();
const NOON_AT = `${(((12 * 60 - DAY_START) / (DAY_END - DAY_START)) * 100).toFixed(1)}%`;

/**
 * The shadow study: the time of day over Mathura on the study date, the
 * sun's path, and a slider that moves the sun for the model and every
 * plan at once. By night the slider swings the one lamp instead. With a
 * mouse, moving across `scope` (the hero) sets the time too.
 */
export function ShadowStudy({
  scope,
  className,
}: {
  /** The id of the element whose width the pointer sweeps as a day. */
  scope?: string;
  className?: string;
}) {
  const minutes = useSunMinutes();
  const night = useRootData("theme", "light") === "dark";
  const motion = useMotionOn();
  const id = React.useId();
  const { reading, valueText } = describeLight(minutes, night);
  const { elevation } = lightAt(minutes, night);

  React.useEffect(() => {
    const el = scope ? document.getElementById(scope) : null;
    if (!el || !motion) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.buttons) return;
      if (e.target instanceof HTMLInputElement) return;
      const r = el.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      setSunMinutes(
        DAY_START + Math.round((f * (DAY_END - DAY_START)) / STEP) * STEP
      );
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, [scope, motion]);

  return (
    <div role="group" aria-labelledby={`${id}-h`} className={cn(className)}>
      <div className="mb-2.5 flex items-baseline justify-between">
        <h2 id={`${id}-h`} className="caps text-ink">
          Shadow study
        </h2>
        <span className="font-mono text-[1.625rem] leading-none tracking-[-0.02em]">
          {night ? "Night" : clock(minutes)}
        </span>
      </div>
      <svg
        viewBox="0 0 300 44"
        aria-hidden
        className="mt-0.5 -mb-0.5 block h-auto w-full overflow-visible"
      >
        <line
          x1={0}
          y1={40}
          x2={300}
          y2={40}
          className="stroke-line-strong [stroke-dasharray:2_3]"
        />
        <path
          d={PATH.d}
          className={cn("fill-none stroke-soft", night && "opacity-35")}
        />
        <circle
          r={5}
          cx={PATH.px(minutes)}
          cy={PATH.py(elevation)}
          className="fill-wood stroke-ink"
        />
      </svg>
      <label htmlFor={`${id}-range`} className="sr-only">
        Time of day for the shadow study
      </label>
      <input
        id={`${id}-range`}
        type="range"
        min={DAY_START}
        max={DAY_END}
        step={STEP}
        value={minutes}
        aria-valuetext={valueText}
        onChange={(e) => setSunMinutes(Number(e.currentTarget.value))}
        className="sun-range"
      />
      <div aria-hidden className="relative h-3.5 num">
        <span className="absolute top-0 left-0">{clock(DAY_START)}</span>
        <span
          className="absolute top-0 -translate-x-1/2"
          style={{ left: NOON_AT }}
        >
          12:00
        </span>
        <span className="absolute top-0 right-0">{clock(DAY_END)}</span>
      </div>
      <p className="mt-2 min-h-[2.9em] text-[0.78125rem] leading-[1.45] text-soft">
        {reading}
      </p>
    </div>
  );
}
