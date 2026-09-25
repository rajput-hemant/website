import { type CSSProperties } from "react";

import type { Experience } from "@/lib/data/types";
import { Reveal } from "@/components/interaction/reveal";

import { computeContinuityLanes } from "./continuity-lanes";
import { ExperienceEntry } from "./experience-entry";
import { TimelineRail, type RailPosition } from "./timeline-rail";

function railPosition(index: number, count: number): RailPosition {
  if (count === 1) return "only";
  if (index === 0) return "first";
  return index === count - 1 ? "last" : "middle";
}

const railGeometry = {
  "--rail-x": "-2.75rem",
  "--lane-gap": "0.75rem",
  // Centre of the first line of the entry's `text-2xl` company heading.
  "--dot-y": "calc(var(--text-2xl) * var(--text-2xl--line-height) / 2)",
} as CSSProperties;

export type ExperienceTimelineProps = {
  /** Newest first, as `getExperience()` returns them. */
  roles: Experience[];
  now: Date;
};

/** Every role as narrative prose, joined on wide screens by a decorative rail. */
export function ExperienceTimeline({ roles, now }: ExperienceTimelineProps) {
  const { rows } = computeContinuityLanes(roles);

  return (
    <ol style={railGeometry}>
      {roles.map((role, index) => (
        <li key={role.id} className="relative pb-20 last:pb-0 sm:pb-24">
          <TimelineRail
            position={railPosition(index, roles.length)}
            segments={rows[index] ?? []}
            current={!role.endDate}
          />
          <Reveal
            as="article"
            id={role.id}
            aria-labelledby={`${role.id}-heading`}
          >
            <ExperienceEntry role={role} now={now} />
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
