import {
  MissionCard,
  StateLamp,
} from "@/flavors/mission/components/projects/mission-card";
import {
  missionState,
  stateLabels,
  type MissionState,
} from "@/flavors/mission/lib/flight";
import { cn } from "@/flavors/mission/lib/utils";

import { projectStatusLabels } from "@/lib/data/labels";
import type { Project, ProjectStatus } from "@/lib/data/types";

const ORDER: ProjectStatus[] = ["maintained", "active", "wip", "archived"];

/** The legend: each mission state, and the project status it stands for. */
export function StateLegend({
  projects,
  className,
}: {
  projects: readonly Project[];
  className?: string;
}) {
  const present = ORDER.filter((s) => projects.some((p) => p.status === s));
  return (
    <ul
      aria-label="Mission states"
      className={cn(
        "flex flex-wrap gap-x-7 gap-y-2 label text-ink-soft",
        className
      )}
    >
      {present.map((status) => {
        const state: MissionState = missionState[status];
        return (
          <li key={status} className="inline-flex items-center gap-2">
            <StateLamp state={state} />
            <b className="font-semibold text-ink">{stateLabels[state]}</b>
            {projectStatusLabels[status].toLowerCase()}
          </li>
        );
      })}
    </ul>
  );
}

/** Missions in a ruled grid: four across, two on a tablet, rows on a phone. */
export function Manifest({
  projects,
  all,
  headingLevel = "h3",
  className,
}: {
  projects: readonly Project[];
  /** Every project, for the legend; defaults to the ones shown. */
  all?: readonly Project[];
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={className}>
      <StateLegend projects={all ?? projects} />
      {/* Each cell rules its own left edge; the first column's rule sits outside the clip. */}
      <div className="mt-8 overflow-hidden border-t border-rule-strong">
        <ol className="grid sm:-ml-6 sm:grid-cols-2 xl:grid-cols-4">
          {projects.map((project, i) => (
            <li
              key={project.id}
              className="border-b border-rule py-7 sm:border-l sm:px-6 sm:py-8"
            >
              <MissionCard
                project={project}
                index={i}
                headingLevel={headingLevel}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
