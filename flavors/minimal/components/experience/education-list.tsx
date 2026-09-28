import { groupEducation } from "@/lib/data/education";
import type { Education } from "@/lib/data/types";
import { formatYearRange } from "@/lib/format";

export function EducationList({ items }: { items: Education[] }) {
  return (
    <ol className="grid gap-6">
      {groupEducation(items).map((group) => (
        <li
          key={group.entries[0]?.id ?? group.institution}
          className="grid gap-3 border-t border-border pt-5"
        >
          <div className="grid gap-0.5">
            <h3 className="font-medium text-foreground">{group.institution}</h3>
            <p className="meta text-subtle">{group.location}</p>
          </div>
          <ul className="grid gap-3 border-l border-border pl-4">
            {group.entries.map((entry) => (
              <li key={entry.id} className="grid gap-0.5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="leading-snug text-muted">{entry.degree}</p>
                  <p className="shrink-0 font-mono text-2xs tracking-wide text-subtle tabular-nums [font-variation-settings:'wdth'_87.5]">
                    {formatYearRange(entry.startYear, entry.endYear)}
                  </p>
                </div>
                {entry.score && (
                  <p className="meta text-subtle">
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
