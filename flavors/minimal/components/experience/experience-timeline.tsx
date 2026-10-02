import * as React from "react";
import { glyphProps } from "@/flavors/minimal/components/scene/glyph";
import { tenureMonths } from "@/flavors/minimal/lib/scene/glyphs";
import { cn } from "@/flavors/minimal/lib/utils";

import { computeContinuityLanes } from "@/lib/data/continuity-lanes";
import type { Experience } from "@/lib/data/types";
import { monthIndex } from "@/lib/format";

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
  const now = new Date();

  return (
    // The beads' view is a strip over the rail, which sits in the gutter left
    // of the list; the dots inside the list are its anchors and posters.
    <div
      data-glyph-scope
      className={cn("relative", styles.timeline)}
      style={{ "--lane-count": laneCount } as React.CSSProperties}
    >
      <span
        aria-hidden
        data-decorative
        {...glyphProps("beads", "beads")}
        className="pointer-events-none absolute inset-y-0 hidden w-8 md:block"
        style={{ left: "calc(var(--rail-x) - 1rem)" }}
      />
      <ol id={id} data-scene-section>
        {roles.map((role, index) => (
          <li key={role.id} className="relative pb-12 last:pb-0 sm:pb-14">
            <TimelineRail
              position={railPosition(index, roles.length)}
              segments={rows[index] ?? []}
              current={!role.endDate}
              roleId={role.id}
            />
            <article
              id={role.id}
              aria-labelledby={`${role.id}-heading`}
              data-scene-item={`role:${role.id}`}
              data-scene-weight={tenureMonths(
                monthIndex(role.startDate),
                monthIndex(role.endDate ?? now)
              )}
              className={styles.entry}
            >
              <ExperienceEntry role={role} />
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
