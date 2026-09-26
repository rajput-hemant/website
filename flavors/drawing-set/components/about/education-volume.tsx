import { Schedule } from "@/flavors/drawing-set/components/ui";

import { groupEducation } from "@/lib/data/education";
import type { Education } from "@/lib/data/types";
import { formatYearRange } from "@/lib/format";

/** A, B, C... the item mark for a row, matching the skills schedule. */
const mark = (index: number) => String.fromCharCode(65 + (index % 26));

/** Education as a schedule: one row per qualification, grouped by institution in list order. */
export function EducationSchedule({ items }: { items: Education[] }) {
  const rows = groupEducation(items)
    .flatMap((group) =>
      group.entries.map((entry) => ({
        institution: (
          <>
            {group.institution}
            <span className="mt-0.5 block font-mono text-mono-xs tracking-[0.08em] text-ink-faint normal-case">
              {group.location}
            </span>
          </>
        ),
        programme: (
          <>
            {entry.degree}
            {entry.score && (
              <span className="mt-0.5 block text-ink-faint">
                <span className="sr-only">Score: </span>
                {entry.score}
              </span>
            )}
          </>
        ),
        years: formatYearRange(entry.startYear, entry.endYear),
      }))
    )
    .map((row, index) => ({ mark: mark(index), ...row }));

  return (
    <Schedule
      caption="Education"
      columns={[
        { key: "mark", label: "Mark", className: "sm:w-14" },
        { key: "institution", label: "Institution" },
        { key: "programme", label: "Programme" },
        { key: "years", label: "Years", align: "right" },
      ]}
      rows={rows}
    />
  );
}
