import { groupEducation } from "@/lib/data/education";
import { type Education } from "@/lib/data/types";
import { formatYearRange } from "@/lib/format";

import styles from "./resume.module.css";

export function ResumeEducation({ entries }: { entries: Education[] }) {
  return (
    <ul className="space-y-4 print:space-y-3">
      {groupEducation(entries).map((group) => (
        <li
          key={group.entries[0]?.id ?? group.institution}
          className={styles.keep}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="font-semibold text-foreground">
              {group.institution}
            </h3>
            <p className="text-[0.9375rem] text-muted">{group.location}</p>
          </div>
          <ul className="mt-1 space-y-0.5 print:mt-0.5">
            {group.entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5"
              >
                <p className="text-[0.9375rem] text-muted">
                  {[entry.degree, entry.score].filter(Boolean).join(" · ")}
                </p>
                <p className="meta whitespace-nowrap text-subtle tabular-nums">
                  {formatYearRange(entry.startYear, entry.endYear)}
                </p>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
