import { groupEducation } from "@/lib/data/education";
import type { Education } from "@/lib/data/types";
import { formatYearRange } from "@/lib/format";

/**
 * "Bound volume": education as a spine of entries, grouped by institution so
 * the school and its location are named once.
 */
export function EducationVolume({ items }: { items: Education[] }) {
  return (
    <ol className="grid gap-6 border-t border-hairline pt-6">
      {groupEducation(items).map((group) => (
        <li
          key={group.entries[0]?.id ?? group.institution}
          className="grid gap-3"
        >
          <div className="grid gap-0.5">
            <h3 className="font-display text-lg text-paper">
              {group.institution}
            </h3>
            <p className="font-mono text-mono-xs text-pencil">
              {group.location}
            </p>
          </div>
          <ul className="grid gap-3 border-l border-hairline pl-4">
            {group.entries.map((entry) => (
              <li key={entry.id} className="grid gap-0.5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm text-graphite">{entry.degree}</p>
                  <p className="shrink-0 font-mono text-mono-xs text-pencil tabular-nums">
                    {formatYearRange(entry.startYear, entry.endYear)}
                  </p>
                </div>
                {entry.score && (
                  <p className="font-mono text-mono-xs text-pencil">
                    <span className="sr-only">Score: </span>
                    {entry.score}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
