import * as React from "react";
import { Dimension } from "@/flavors/drawing-set/components/ui";
import {
  formatTenure,
  tenure,
  tenureMonths,
} from "@/flavors/drawing-set/lib/dates";
import { cn } from "@/flavors/drawing-set/lib/utils";

import type { Experience } from "@/lib/data/types";
import { formatMonthYear } from "@/lib/format";

import { computeContinuityLanes } from "./continuity-lanes";
import { ExperienceEntry } from "./experience-entry";
import styles from "./experience.module.css";
import { TimelineRail } from "./timeline-rail";

const PX_PER_MONTH = 6;
const MIN_SEGMENT_PX = 64;
const BASE_SEGMENT_PX = 40;

/** A role's chain segment length: proportional to its tenure, never cramped. */
function segmentHeight(role: Experience): number {
  const months = tenureMonths(
    tenure(role.startDate, role.endDate ?? new Date())
  );
  return Math.max(MIN_SEGMENT_PX, BASE_SEGMENT_PX + months * PX_PER_MONTH);
}

export type ExperienceTimelineProps = {
  id?: string;
  /** Newest first, as `getExperience()` returns them. */
  roles: Experience[];
};

/**
 * The chain dimension: one proportional `<Dimension>` segment per role,
 * stacked with no gap so consecutive arrowheads read as a single chain.
 * Continuity brackets (`computeContinuityLanes`, reused unchanged from the
 * old timeline) mark moves that skip over other roles; an adjacent move
 * already reads as joined, since the chain never gaps between rows. Mobile
 * drops the labels for a thin rail.
 */
export function ExperienceTimeline({ id, roles }: ExperienceTimelineProps) {
  const containerId = id ?? "roles";
  const { rows } = computeContinuityLanes(roles);

  return (
    <>
      <ol id={containerId} data-scene-section className="grid">
        {roles.map((role, index) => (
          <li key={role.id} className={cn(styles.row, "group/row")}>
            <div
              className={styles.segment}
              style={
                {
                  "--segment-h": `${segmentHeight(role)}px`,
                } as React.CSSProperties
              }
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line-strong md:hidden"
              />
              <Dimension
                orientation="v"
                start={formatMonthYear(role.startDate)}
                end={role.endDate ? formatMonthYear(role.endDate) : "Present"}
                label={formatTenure(role.startDate, role.endDate ?? new Date())}
                className="hidden h-full md:block"
              />
              <TimelineRail segments={rows[index] ?? []} />
              {/* Redline tick in the margin, on hover or focus within the row. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-3 hidden w-px origin-center scale-y-0 bg-accent transition-transform duration-(--duration-ui) ease-enter md:block fine:motion:group-focus-within/row:scale-y-100 fine:motion:group-hover/row:scale-y-100"
              />
            </div>
            <article
              id={role.id}
              data-scene-item={`role:${role.id}`}
              data-scene-weight={tenureMonths(
                tenure(role.startDate, role.endDate ?? new Date())
              )}
              data-year={role.startDate.slice(0, 4)}
              aria-labelledby={`${role.id}-heading`}
              className="pb-10 last:pb-0 sm:pb-12"
            >
              <ExperienceEntry role={role} index={index + 1} />
            </article>
          </li>
        ))}
      </ol>
    </>
  );
}
