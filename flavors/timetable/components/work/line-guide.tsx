import {
  boardDates,
  serviceDates,
} from "@/flavors/timetable/components/network/network-section";
import {
  LineBadge,
  lineVar,
} from "@/flavors/timetable/components/ui/line-badge";
import { RichText } from "@/flavors/timetable/components/ui/rich-text";
import type { NetworkLine } from "@/flavors/timetable/lib/network";

import { employmentLabels } from "@/lib/data/labels";
import type { Experience } from "@/lib/data/types";
import { formatTenure } from "@/lib/format";

/**
 * One line's guide: its roundel and colour, the service dates, where it
 * runs, what it was for, the stops on the way (highlights) and where to
 * change. Each guide lights its line on the indicator while it is on screen.
 */
export function LineGuide({
  role,
  line,
}: {
  role: Experience;
  line: NetworkLine;
}) {
  const months = Math.max(1, line.to - line.from + 1);
  return (
    <article
      id={role.id}
      aria-labelledby={`${role.id}-heading`}
      data-scene-item={`role:${role.id}`}
      data-scene-line={line.colour}
      data-scene-weight={months}
      data-scene-label={`${role.company}|${boardDates(role.startDate, role.endDate)}`}
      style={{ "--c": lineVar(line.colour) } as React.CSSProperties}
      className="group grid scroll-mt-[calc(var(--header-height)+1.5rem)] gap-x-6 gap-y-6 border-t border-rule py-12 lg:grid-cols-12"
    >
      <header className="lg:col-span-4">
        <div className="flex items-center gap-3">
          <LineBadge
            line={line.colour}
            name={role.company}
            className="size-10 text-base"
          />
          <span
            aria-hidden
            className="h-[7px] flex-1 rounded-full bg-(--c) opacity-90 transition-[opacity] group-data-[scene-active]:opacity-100"
          />
        </div>
        <h3
          id={`${role.id}-heading`}
          className="mt-5 text-h3 font-extrabold tracking-[-0.015em]"
        >
          {role.companyUrl ? (
            <a
              href={role.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-transparent decoration-2 underline-offset-[0.2em] fine:hover:decoration-current"
            >
              {role.company}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            role.company
          )}
        </h3>
        <p className="mt-1 text-lead leading-snug text-ink-soft">
          {role.title}
        </p>
        <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 font-mono text-mono-sm">
          <dt className="text-ink-soft uppercase">Service</dt>
          <dd>{serviceDates(role.startDate, role.endDate)}</dd>
          <dt className="text-ink-soft uppercase">Length</dt>
          <dd>{formatTenure(role.startDate, role.endDate ?? new Date())}</dd>
          <dt className="text-ink-soft uppercase">Runs</dt>
          <dd>
            {role.remote ? "Remote" : role.location}
            {role.remote && role.location ? `, ${role.location}` : ""}
          </dd>
          <dt className="text-ink-soft uppercase">Type</dt>
          <dd>
            {role.employmentNote ?? employmentLabels[role.employmentType]}
          </dd>
        </dl>
      </header>

      <div className="min-w-0 lg:col-span-7 lg:col-start-6">
        {role.note ? (
          <p className="text-statement leading-snug font-semibold tracking-[-0.012em]">
            {role.note}
          </p>
        ) : null}
        <RichText
          value={role.body}
          className={role.note ? "mt-5" : undefined}
        />
        {role.highlights.length > 0 ? (
          <>
            <h4 className="mt-8 font-mono text-mono-xs font-bold tracking-[0.1em] text-ink-soft uppercase">
              Stops on this line
            </h4>
            <ol className="mt-3 grid gap-0">
              {role.highlights.map((highlight, i) => (
                <li
                  key={highlight}
                  className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 pb-4 last:pb-0"
                >
                  <span aria-hidden className="relative flex justify-center">
                    {i < role.highlights.length - 1 ? (
                      <span className="absolute top-3 -bottom-1 w-[5px] bg-(--c)" />
                    ) : null}
                    <span className="relative mt-1.5 size-3 rounded-full border-[3px] border-(--c) bg-ground" />
                  </span>
                  <span className="leading-snug">{highlight}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}
        {role.continuedInto || role.continuedFrom || role.endNote ? (
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-surface px-4 py-3 text-sm shadow-[inset_4px_0_0_var(--color-signal)]">
            {role.continuedFrom ? (
              <span>
                Change here from{" "}
                <a
                  href={`#${role.continuedFrom.id}`}
                  className="font-bold underline underline-offset-[0.2em]"
                >
                  {role.continuedFrom.company}
                </a>
                {role.continuedFrom.note ? `: ${role.continuedFrom.note}` : ""}
              </span>
            ) : null}
            {role.continuedInto ? (
              <span>
                Change here for{" "}
                <a
                  href={`#${role.continuedInto.id}`}
                  className="font-bold underline underline-offset-[0.2em]"
                >
                  {role.continuedInto.company}
                </a>
                {role.continuedInto.note ? `: ${role.continuedInto.note}` : ""}
              </span>
            ) : null}
            {role.endNote ? <span>Terminated: {role.endNote}</span> : null}
          </p>
        ) : null}
      </div>
    </article>
  );
}
