import { type Education } from "@/lib/data/types";
import { formatYearRange } from "@/lib/format";

import styles from "./resume.module.css";

export function ResumeEducation({ entries }: { entries: Education[] }) {
  return (
    <ul className="space-y-4 print:space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className={styles.keep}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
            <h3 className="font-semibold text-foreground">{entry.degree}</h3>
            <p className="meta whitespace-nowrap text-subtle tabular-nums">
              {formatYearRange(entry.startYear, entry.endYear)}
            </p>
          </div>
          <p className="mt-0.5 text-[0.9375rem] text-muted">
            {[entry.institution, entry.location, entry.score]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
