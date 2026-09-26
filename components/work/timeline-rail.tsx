import { cn } from "@/lib/utils";

import type { LaneSegment } from "./continuity-lanes";

/*
 * The continuity brackets beside a role's chain segment, anchored to that
 * segment's own box (0% top, 100% bottom) rather than a page-wide rail: each
 * segment is now an independent `<Dimension>` of its own proportional
 * height, so a bracket only ever needs to reach the segment's near edge.
 */
const RAIL_X = "0px";
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

  const bracket =
    kind === "start" ? { top: "50%", bottom: 0 } : { top: 0, height: "50%" };

  return (
    <>
      {crossesInnerLane && (
        <span
          className="absolute z-1 h-[7px] -translate-y-1/2 bg-ground"
          style={{
            top: "50%",
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
        style={{ ...bracket, left: laneX(lane), width: laneWidth(lane) }}
      />
    </>
  );
}

/** Continuity brackets for one role's segment: nothing when it joins no other. */
export function TimelineRail({ segments }: { segments: LaneSegment[] }) {
  if (segments.length === 0) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden md:block"
    >
      {segments.map((segment) => (
        <Segment key={`${segment.lane}-${segment.kind}`} {...segment} />
      ))}
    </div>
  );
}
