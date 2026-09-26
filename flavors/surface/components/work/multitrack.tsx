import Link from "next/link";
import { layTape } from "@/flavors/surface/lib/tape";
import { cn } from "@/flavors/surface/lib/utils";

import type { Experience } from "@/lib/data/types";
import { formatDateRange, formatTenure } from "@/lib/format";

type MultitrackProps = {
  roles: readonly Experience[];
  today: Date;
  /** Where a track leads: the home page links to /work, /work links to its own entries. */
  hrefFor: (role: Experience) => string;
  /** Mark tracks as knob detents (the /work page). */
  detents?: boolean;
  className?: string;
};

/**
 * Every role as a clip on its own track of one tape, so the overlaps between
 * them read at a glance. Roles in progress run to the playhead (today) with a
 * lit lamp. Each track is a link with its full dates in text.
 */
export function Multitrack({
  roles,
  today,
  hrefFor,
  detents,
  className,
}: MultitrackProps) {
  const tape = layTape(roles, today);
  const first = tape.years[0]?.year;
  const last = tape.years.at(-1)?.year;

  return (
    <div className={cn("mod p-3 sm:p-4", className)}>
      <div className="flex items-baseline justify-between gap-4 px-1 pb-3">
        <p className="legend">
          {roles.length} tracks
          <span aria-hidden> &nbsp;·&nbsp; </span>
          {first} to {last}
        </p>
        <p aria-hidden className="legend flex items-center gap-2 max-sm:hidden">
          <span className="inline-block h-3 w-px bg-signal" /> Today
        </p>
      </div>

      <div className="glass relative overflow-hidden py-2">
        {/* The time axis: year seams across every lane, labelled once at the top. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-3 left-3 sm:left-[14.25rem]"
        >
          {tape.years.map(({ year, left }) => (
            <span
              key={year}
              className="absolute inset-y-0 border-l border-lcd-ink-2/30"
              style={{ left: `${left * 100}%` }}
            >
              <span className="legend absolute top-0 left-1.5 text-[0.59375rem]">
                {year}
              </span>
            </span>
          ))}
          <span
            className="absolute inset-y-0 w-px bg-signal"
            style={{ left: `${tape.now * 100}%` }}
          />
        </div>

        <ol className="relative pt-5">
          {roles.map((role, i) => {
            const clip = tape.clips[i]!;
            return (
              <li key={role.id}>
                <Link
                  href={hrefFor(role)}
                  data-knob-mirror={detents ? i : undefined}
                  data-lamp-host
                  className="group grid grid-cols-1 items-center gap-x-4 gap-y-1.5 rounded-[4px] px-3 py-2 outline-offset-[-2px] transition-[background-color] duration-150 data-[knob-active]:bg-lcd-ink/[0.08] sm:grid-cols-[12.5rem_minmax(0,1fr)] fine:hover:bg-lcd-ink/[0.06]"
                >
                  <span className="flex min-w-0 items-baseline gap-2.5">
                    <span
                      aria-hidden
                      className="legend w-5 shrink-0 text-[0.59375rem]"
                    >
                      T{i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[0.9375rem] leading-tight tracking-[0.02em]">
                        {role.company}
                      </span>
                      <span className="block truncate text-[0.75rem] leading-snug text-lcd-ink-2">
                        {role.title}
                      </span>
                    </span>
                  </span>
                  <span className="relative block h-6">
                    <span
                      className="absolute inset-y-0 flex items-center justify-end rounded-[3px] bg-lcd-ink/85 px-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] transition-[background-color] duration-150 group-hover:bg-lcd-ink group-data-[knob-active]:bg-lcd-ink"
                      style={{
                        left: `${clip.left * 100}%`,
                        width: `${clip.width * 100}%`,
                      }}
                    >
                      {clip.ongoing && (
                        <span aria-hidden data-on className="led" />
                      )}
                    </span>
                  </span>
                  <span className="sr-only">
                    {formatDateRange(role.startDate, role.endDate)},{" "}
                    {formatTenure(role.startDate, role.endDate ?? today)}
                    {clip.ongoing ? ", ongoing" : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
