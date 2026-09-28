import Link from "next/link";
import { FlapText } from "@/flavors/timetable/components/ui/flap-text";
import { departures } from "@/flavors/timetable/lib/board";
import { cn } from "@/flavors/timetable/lib/utils";

import { stackSlug } from "@/lib/data/stack-slug";
import type { Project } from "@/lib/data/types";

const toneClass = {
  on: "text-flap",
  late: "text-signal",
  off: "text-flap-soft",
} as const;

export type DepartureBoardProps = {
  projects: Project[];
  /** Total on the full board, for the heading strip. */
  total: number;
  /** Heading strip, left: what the board lists. */
  title: string;
  /** A last row pointing at the full board. */
  more?: { href: string; label: string };
  id?: string;
  className?: string;
};

/**
 * Projects as a departures board: the year it left, where it goes (the
 * project), the stops it calls at (its stack), its platform (the main
 * technology) and its status. A real table; the flaps are decoration.
 */
export function DepartureBoard({
  projects,
  total,
  title,
  more,
  id,
  className,
}: DepartureBoardProps) {
  return (
    <div
      id={id}
      data-dark-surface
      className={cn(
        "rounded-lg bg-board px-4 pt-1 pb-3 text-flap shadow-board sm:px-8 sm:pb-5 dark:shadow-[0_0_0_1px_var(--color-rule)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-board-rule py-4 font-mono text-mono-sm font-semibold tracking-[0.1em] text-flap-soft uppercase">
        <span>{title}</span>
        <span aria-live="polite">
          <b data-board-count className="font-semibold text-signal">
            {projects.length}
          </b>{" "}
          of {total} shown
        </span>
      </div>
      <table className="w-full border-collapse max-md:block">
        <caption className="sr-only">
          {title}: year started, project, stack, main platform and status.
        </caption>
        <thead className="max-md:sr-only">
          <tr className="font-mono text-mono-xs tracking-[0.1em] text-flap-soft uppercase">
            <th scope="col" className="py-4 pr-4 text-left font-semibold">
              Time
            </th>
            <th scope="col" className="py-4 pr-4 text-left font-semibold">
              Destination
            </th>
            <th scope="col" className="py-4 pr-4 text-left font-semibold">
              Calling at
            </th>
            <th scope="col" className="py-4 pr-4 text-left font-semibold">
              Platform
            </th>
            <th scope="col" className="py-4 text-right font-semibold">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="max-md:block">
          {projects.map((project) => {
            const status = departures[project.status];
            const [platform = "", ...via] = project.stack;
            const href = `/projects/${project.slug}`;
            return (
              <tr
                key={project.id}
                data-platform={stackSlug(platform || "Web")}
                data-scene-item={`project:${project.slug}`}
                data-scene-href={href}
                data-cursor="Board"
                data-scene-label={`${project.name}|${project.year}|${status.label}`}
                className={cn(
                  "group border-t border-board-rule align-top max-md:grid max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-x-3 max-md:gap-y-3 max-md:py-5 max-md:first:border-t-0",
                  status.tone === "off" && "[&_[data-flap]]:opacity-55"
                )}
              >
                <td className="w-px py-5 pr-4 whitespace-nowrap max-md:col-start-1 max-md:row-start-1 max-md:p-0">
                  <FlapText text={String(project.year)} size="md" />
                </td>
                <td className="py-5 pr-4 max-md:col-span-2 max-md:row-start-2 max-md:p-0">
                  <Link
                    href={href}
                    className="inline-block rounded-[3px] fine:group-hover:[&_[data-flap]>span]:shadow-[inset_0_0_0_1px_var(--color-signal)]"
                  >
                    <FlapText text={project.name} cells={12} size="md" />
                  </Link>
                  <p className="mt-2.5 max-w-[46ch] text-sm leading-snug text-flap-soft">
                    {project.tagline}
                  </p>
                </td>
                <td className="py-5 pt-6 pr-4 text-sm leading-normal max-md:col-span-2 max-md:row-start-3 max-md:p-0">
                  <span className="mb-1.5 block font-mono text-[0.65625rem] font-semibold tracking-[0.1em] text-flap-soft uppercase md:hidden">
                    Calling at
                  </span>
                  {via.length > 0 ? via.slice(0, 4).join(", ") : "Non-stop"}
                </td>
                <td className="py-5 pt-6 pr-4 max-md:col-start-1 max-md:row-start-4 max-md:p-0">
                  <span className="sr-only">Platform </span>
                  <span className="inline-block rounded-[3px] bg-flap px-2 pt-1.5 pb-1 text-sm leading-none font-bold whitespace-nowrap text-signal-ink">
                    {platform || "Web"}
                  </span>
                </td>
                <td
                  className={cn(
                    "py-5 pt-7 text-right font-mono text-[0.9375rem] leading-none font-bold tracking-[0.04em] whitespace-nowrap max-md:col-start-2 max-md:row-start-1 max-md:self-center max-md:p-0",
                    toneClass[status.tone]
                  )}
                >
                  {status.label}
                  <span className="sr-only"> ({status.meaning})</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {more ? (
        <Link
          href={more.href}
          className="mt-1 flex min-h-11 items-center justify-between border-t border-board-rule pt-3 font-mono text-mono-sm font-semibold tracking-[0.08em] text-flap-soft uppercase transition-colors fine:hover:text-signal"
        >
          {more.label}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}

/** What the status column means, in plain words. */
export function DepartureLegend({ className }: { className?: string }) {
  const rows = [
    { term: "Time", meaning: "year started" },
    { term: "Platform", meaning: "main stack" },
    ...Object.values(departures).map((d) => ({
      term: d.label,
      meaning: d.meaning,
      tone: d.tone,
    })),
  ];
  return (
    <dl
      className={cn(
        "flex flex-wrap gap-x-8 gap-y-3 font-mono text-mono-sm text-ink-soft",
        className
      )}
    >
      {rows.map((row) => (
        <div key={row.term} className="flex items-baseline gap-2">
          {"tone" in row ? (
            <span
              aria-hidden
              className={cn(
                "size-2.5 self-center rounded-full",
                row.tone === "on" && "bg-ink",
                row.tone === "late" &&
                  "bg-signal shadow-[0_0_0_1.5px_var(--color-ink)]",
                row.tone === "off" &&
                  "shadow-[inset_0_0_0_1.5px_var(--color-ink-soft)]"
              )}
            />
          ) : null}
          <dt className="font-bold text-ink">{row.term}</dt>
          <dd>{row.meaning}</dd>
        </div>
      ))}
    </dl>
  );
}
