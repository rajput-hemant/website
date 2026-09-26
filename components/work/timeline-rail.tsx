import * as React from "react";

import { cn } from "@/lib/utils";

import type { LaneSegment } from "./continuity-lanes";

export type RailPosition = "first" | "middle" | "last" | "only";

export type TimelineRailProps = {
  position: RailPosition;
  segments: LaneSegment[];
  /** An ongoing role gets a filled accent dot. */
  current: boolean;
};

/*
 * Geometry, relative to the left edge of the entry. The dot sits level with the
 * centre of the entry's first heading line (`--dot-y`, set by the list).
 */
const RAIL_X = "var(--rail-x)";
const laneX = (lane: number) => `calc(${RAIL_X} - ${lane} * var(--lane-gap))`;
const laneWidth = (lane: number) => `calc(${lane} * var(--lane-gap))`;

function Segment({ lane, kind, crossesInnerLane }: LaneSegment) {
  if (kind === "through") {
    return (
      <span
        className="absolute inset-y-0 w-px bg-accent/40"
        style={{ left: laneX(lane) }}
      />
    );
  }

  // Offset half a pixel so the bracket's horizontal edge is centred on the dot.
  const bracket: React.CSSProperties =
    kind === "start"
      ? { top: "calc(var(--dot-y) - 0.5px)", bottom: 0 }
      : { top: 0, height: "calc(var(--dot-y) + 0.5px)" };

  return (
    <>
      {crossesInnerLane && (
        <span
          className="absolute z-1 h-[7px] -translate-y-1/2 bg-ink"
          style={{
            top: "var(--dot-y)",
            left: `calc(${laneX(lane)} + 0.5rem)`,
            width: `calc(${laneWidth(lane)} - 0.5rem)`,
          }}
        />
      )}
      <span
        className={cn(
          "absolute z-2 border-l border-accent/40",
          kind === "start"
            ? "rounded-tl-[0.4rem] border-t"
            : "rounded-bl-[0.4rem] border-b"
        )}
        style={{
          ...bracket,
          left: laneX(lane),
          width: laneWidth(lane),
        }}
      />
    </>
  );
}

/**
 * The decorative rail beside one entry: its piece of the vertical line, its
 * dot, and the continuity brackets that pass through it. Shown from tablet
 * width, where the gutter has room for it.
 */
export function TimelineRail({
  position,
  segments,
  current,
}: TimelineRailProps) {
  const lineTop =
    position === "first" || position === "only" ? "var(--dot-y)" : 0;
  const lineBottom =
    position === "last" || position === "only"
      ? "calc(100% - var(--dot-y))"
      : 0;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 hidden md:block print:hidden"
    >
      {position !== "only" && (
        <span
          className="absolute w-px bg-rule"
          style={{ left: RAIL_X, top: lineTop, bottom: lineBottom }}
        />
      )}
      {segments.map((segment) => (
        <Segment key={`${segment.lane}-${segment.kind}`} {...segment} />
      ))}
      <span
        className={cn(
          "absolute z-3 size-2.25 -translate-x-1/2 -translate-y-1/2 rounded-full",
          current
            ? "bg-accent ring-4 ring-accent-soft"
            : "border border-rule bg-ink"
        )}
        style={{ left: `calc(${RAIL_X} + 0.5px)`, top: "var(--dot-y)" }}
      />
    </div>
  );
}
