import Link from "next/link";
import {
  ExternalLink,
  Led,
  Legend,
} from "@/flavors/surface/components/ui/primitives";
import { RichText } from "@/flavors/surface/components/ui/rich-text";
import { cn } from "@/flavors/surface/lib/utils";

import { employmentLabels } from "@/lib/data/labels";
import type { Experience } from "@/lib/data/types";
import { formatDateRange, formatTenure, toMonthDateTime } from "@/lib/format";

import { LiveTenure } from "./live-tenure";

/**
 * One role as a channel strip: the track number and lamp, the company and
 * title, a small LCD with the dates and tenure, then what I did there.
 */
export function RoleStrip({
  role,
  track,
  today,
  className,
}: {
  role: Experience;
  track: number;
  today: Date;
  className?: string;
}) {
  const ongoing = !role.endDate;
  const employment =
    role.employmentNote ?? employmentLabels[role.employmentType];

  return (
    <article
      id={role.id}
      data-knob-item={track - 1}
      aria-labelledby={`${role.id}-title`}
      className={cn(
        "rack-mod grid scroll-mt-[calc(var(--header-height)+1.5rem)] gap-6 px-[22px] pt-9 pb-8 transition-[box-shadow] duration-200 data-[knob-active]:shadow-[inset_0_1px_0_var(--color-hi),0_0_0_1px_var(--color-ink-3),0_10px_22px_-16px_rgb(0_0_0/0.45)] md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8",
        className
      )}
    >
      <div className="grid content-start gap-4">
        <p className="legend flex items-center gap-2">
          <Led on={ongoing} />
          Track {track}
          {ongoing && <span className="sr-only">, ongoing</span>}
        </p>
        <div className="glass px-3.5 py-3">
          <p className="matrix text-[0.8125rem] leading-snug">
            <time dateTime={toMonthDateTime(role.startDate)}>
              {formatDateRange(role.startDate, role.endDate).replace(
                " – ",
                " to "
              )}
            </time>
          </p>
          <p className="matrix mt-1 text-[0.8125rem] leading-snug text-lcd-ink-2">
            <LiveTenure
              start={role.startDate}
              end={role.endDate}
              built={formatTenure(role.startDate, role.endDate ?? today)}
            />
          </p>
        </div>
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="legend text-[0.625rem]">Terms</dt>
            <dd>{employment}</dd>
          </div>
          <div>
            <dt className="legend text-[0.625rem]">Based</dt>
            <dd>
              {role.location}
              {role.remote ? ", remote" : ""}
            </dd>
          </div>
          {role.endNote && (
            <div>
              <dt className="legend text-[0.625rem]">Ended</dt>
              <dd>{role.endNote}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="min-w-0">
        <h3 id={`${role.id}-title`} className="text-h3 tracking-[-0.012em]">
          {role.companyUrl ? (
            <ExternalLink
              href={role.companyUrl}
              className="decoration-2 underline-offset-[0.14em]"
            >
              {role.company}
            </ExternalLink>
          ) : (
            role.company
          )}
        </h3>
        <p className="mt-2 font-medium">{role.title}</p>
        {role.companyBlurb && (
          <p className="mt-1 text-sm text-ink-2">{role.companyBlurb}</p>
        )}

        <RichText value={role.body} className="mt-6" />

        {role.highlights.length > 0 && (
          <ul className="mt-6 grid gap-2">
            {role.highlights.map((item) => (
              <li
                key={item}
                className="grid grid-cols-[1rem_1fr] gap-2 text-base"
              >
                <span
                  aria-hidden
                  className="mt-[0.6em] block size-1.5 rounded-full bg-ink-3"
                />
                {item}
              </li>
            ))}
          </ul>
        )}

        {role.note && (
          <aside aria-label="Why it mattered" className="seam-t mt-6 pt-4">
            <Legend aria-hidden>Why it mattered</Legend>
            <p className="mt-1.5 max-w-[56ch] text-sm text-ink-2">
              {role.note}
            </p>
          </aside>
        )}

        {(role.continuedFrom || role.continuedInto) && (
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2">
            {role.continuedFrom && (
              <Link
                href={`#${role.continuedFrom.id}`}
                className="underline decoration-ink-3 underline-offset-[0.22em] fine:hover:decoration-ink"
              >
                Continued from {role.continuedFrom.company}
              </Link>
            )}
            {role.continuedInto && (
              <Link
                href={`#${role.continuedInto.id}`}
                className="underline decoration-ink-3 underline-offset-[0.22em] fine:hover:decoration-ink"
              >
                Continued into {role.continuedInto.company}
              </Link>
            )}
          </p>
        )}
      </div>
    </article>
  );
}
