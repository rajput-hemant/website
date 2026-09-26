"use client";

import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

import {
  belowFold,
  motionOn,
  mountedByNavigation,
  observeOnce,
} from "@/lib/motion/entrance";

import { VisuallyHidden } from "./visually-hidden";

export type DimensionProps = {
  label: string;
  start?: string;
  end?: string;
  /** @default "h" */
  orientation?: "h" | "v";
  className?: string;
};

// `data-plot="pending"` hides the linework; switching to "drawn" plots it in.
const stroke =
  "[stroke-dasharray:1] motion:group-data-[plot=pending]/dim:[stroke-dashoffset:1] group-data-[plot=drawn]/dim:transition-[stroke-dashoffset] group-data-[plot=drawn]/dim:duration-400 group-data-[plot=drawn]/dim:ease-glide";
const fade =
  "motion:group-data-[plot=pending]/dim:opacity-0 group-data-[plot=drawn]/dim:transition-opacity group-data-[plot=drawn]/dim:delay-200 group-data-[plot=drawn]/dim:duration-200";
const text =
  "absolute bg-[var(--dim-knockout,var(--color-ground))] font-mono text-mono-xs leading-none tracking-[0.08em] whitespace-nowrap uppercase";

/**
 * A dimension line for a true measurement: arrowheads, end ticks and a centred
 * label. Set `--dim-knockout` when it sits on something other than `ground`.
 */
export function Dimension({
  label,
  start,
  end,
  orientation = "h",
  className,
}: DimensionProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const arrow = React.useId();
  const h = orientation === "h";

  React.useLayoutEffect(() => {
    const el = ref.current;
    const byNavigation = mountedByNavigation();
    if (!el || !motionOn()) return;
    if (!byNavigation && !belowFold(el)) return;

    el.dataset.plot = "pending";
    return observeOnce(
      el,
      () => {
        void el.getBoundingClientRect();
        el.dataset.plot = "drawn";
      },
      "0px 0px -10% 0px"
    );
  }, []);

  const spoken = start && end ? `${label}, ${start} to ${end}` : label;

  return (
    <span
      ref={ref}
      data-dimension
      className={cn(
        "group/dim relative block text-ink-soft",
        h ? "h-6 w-full" : "h-full min-h-24 w-6",
        className
      )}
    >
      <svg
        aria-hidden
        focusable="false"
        className="absolute inset-0 size-full overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      >
        <defs>
          <marker
            id={arrow}
            viewBox="0 0 9 6"
            refX={9}
            refY={3}
            markerWidth={9}
            markerHeight={6}
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path
              d="M0 0L9 3L0 6z"
              fill="currentColor"
              stroke="none"
              className={fade}
            />
          </marker>
        </defs>
        {h ? (
          <>
            <line
              x1="0"
              y1="12.5"
              x2="100%"
              y2="12.5"
              pathLength={1}
              markerStart={`url(#${arrow})`}
              markerEnd={`url(#${arrow})`}
              className={stroke}
            />
            <g shapeRendering="crispEdges" className={fade}>
              <line x1="0.5" y1="2" x2="0.5" y2="22" />
              <line x1="100%" y1="2" x2="100%" y2="22" />
            </g>
          </>
        ) : (
          <>
            <line
              x1="12.5"
              y1="0"
              x2="12.5"
              y2="100%"
              pathLength={1}
              markerStart={`url(#${arrow})`}
              markerEnd={`url(#${arrow})`}
              className={stroke}
            />
            <g shapeRendering="crispEdges" className={fade}>
              <line x1="2" y1="0.5" x2="22" y2="0.5" />
              <line x1="2" y1="100%" x2="22" y2="100%" />
            </g>
          </>
        )}
      </svg>
      <span aria-hidden>
        {start ? (
          <span
            className={cn(
              text,
              h
                ? "top-1/2 left-2.5 -translate-y-1/2 px-2"
                : "top-3 left-1/2 -translate-x-1/2 py-1.5"
            )}
          >
            {start}
          </span>
        ) : null}
        <span
          className={cn(
            text,
            "top-1/2 left-1/2 -translate-1/2",
            h ? "px-3.5" : "py-2"
          )}
        >
          {label}
        </span>
        {end ? (
          <span
            className={cn(
              text,
              h
                ? "top-1/2 right-2.5 -translate-y-1/2 px-2"
                : "bottom-3 left-1/2 -translate-x-1/2 py-1.5"
            )}
          >
            {end}
          </span>
        ) : null}
      </span>
      <VisuallyHidden>{spoken}</VisuallyHidden>
    </span>
  );
}
