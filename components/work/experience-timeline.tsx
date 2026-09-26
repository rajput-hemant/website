import * as React from "react";

import type { Experience } from "@/lib/data/types";

import { computeContinuityLanes } from "./continuity-lanes";
import { ExperienceEntry } from "./experience-entry";
import styles from "./experience.module.css";
import { TimelineRail, type RailPosition } from "./timeline-rail";

function railPosition(index: number, count: number): RailPosition {
  if (count === 1) return "only";
  if (index === 0) return "first";
  return index === count - 1 ? "last" : "middle";
}

export type ExperienceTimelineProps = {
  id?: string;
  /** Newest first, as `getExperience()` returns them. */
  roles: Experience[];
};

/**
 * Every role as a summary that opens to its story. From tablet width a
 * decorative rail joins them; wider still, each role's dates move into a
 * left rail and its note into the right margin (experience.module.css).
 */
export function ExperienceTimeline({ id, roles }: ExperienceTimelineProps) {
  const { rows, laneCount } = computeContinuityLanes(roles);

  return (
    <ol
      id={id}
      className={styles.timeline}
      style={{ "--lane-count": laneCount } as React.CSSProperties}
    >
      {roles.map((role, index) => (
        <li key={role.id} className="relative pb-12 last:pb-0 sm:pb-14">
          <TimelineRail
            position={railPosition(index, roles.length)}
            segments={rows[index] ?? []}
            current={!role.endDate}
          />
          <article
            id={role.id}
            data-year={role.startDate.slice(0, 4)}
            aria-labelledby={`${role.id}-heading`}
            className={styles.entry}
          >
            <ExperienceEntry role={role} index={index + 1} />
          </article>
        </li>
      ))}
    </ol>
  );
}
