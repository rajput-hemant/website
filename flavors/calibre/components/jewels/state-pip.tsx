import { states } from "@/flavors/calibre/lib/movement";

import type { ProjectStatus } from "@/lib/data/types";

/** A jewel's state: the pip and the watchmaker's word. */
export function StatePip({ status }: { status: ProjectStatus }) {
  const state = states[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="pip" data-pip={state.pip} />
      {state.word}
    </span>
  );
}

/** The legend: each state in use and what it means. */
export function StateLegend({
  statuses,
  className,
}: {
  statuses: readonly ProjectStatus[];
  className?: string;
}) {
  return (
    <ul className={className ?? "flex flex-wrap gap-x-7 gap-y-2 spec"}>
      {statuses.map((status) => (
        <li key={status} className="inline-flex items-center gap-2">
          <span aria-hidden className="pip" data-pip={states[status].pip} />
          {states[status].word}: {states[status].meaning.toLowerCase()}
        </li>
      ))}
    </ul>
  );
}
