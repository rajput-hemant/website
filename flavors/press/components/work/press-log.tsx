import Link from "next/link";
import { pad2, type PressLog as Log } from "@/flavors/press/lib/proof";
import { cn, route } from "@/flavors/press/lib/utils";

import { formatMonthYear } from "@/lib/format";

const pct = (n: number) => `${(n * 100).toFixed(3)}%`;

/**
 * The press log: one run per role on a single month axis, so overlapping
 * roles read as overlapping runs. Each run prints in two plates that
 * register when you point at it; the run still on press is yellow.
 */
export function PressLog({
  log,
  hrefFor,
  className,
}: {
  log: Log;
  /** Where each run links: the role's entry. */
  hrefFor: (id: string) => string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div
        aria-hidden
        className="hidden grid-cols-[3rem_15rem_minmax(0,1fr)_10rem] gap-x-5 pb-2 slug lg:grid"
      >
        <span>Run</span>
        <span>Press</span>
        <span className="relative">
          {log.years.map((tick) => (
            <span
              key={tick.year}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: pct(tick.at) }}
            >
              {tick.year}
            </span>
          ))}
        </span>
        <span className="text-right">Dates</span>
      </div>
      <ol className="border-t-2 border-ink">
        {log.runs.map((run) => (
          <li key={run.role.id} className="border-b border-rule">
            <Link
              href={route(hrefFor(run.role.id))}
              data-scene-item={`run:${run.role.id}`}
              data-cursor={`Run ${pad2(run.run)}`}
              className="registers group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3.5 lg:grid-cols-[3rem_15rem_minmax(0,1fr)_10rem] lg:gap-x-5"
            >
              <span className="slug text-slug-lg text-ink!">
                {pad2(run.run)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lead leading-tight font-extrabold tracking-[-0.02em] underline decoration-transparent decoration-3 underline-offset-[0.2em] transition-[text-decoration-color] duration-(--duration-ui) fine:group-hover:decoration-pink">
                  {run.role.company}
                </span>
                <span className="block truncate text-sm text-ink-soft">
                  {run.role.title}
                </span>
              </span>
              <span className="text-right slug lg:order-last">
                <span className="block">
                  {formatMonthYear(run.role.startDate)} to{" "}
                  {run.role.endDate ? formatMonthYear(run.role.endDate) : "now"}
                </span>
                <span className="block">{run.tenure}</span>
              </span>
              <span
                aria-hidden
                className="relative col-span-3 h-4 shadow-[inset_0_-1px_0_var(--color-rule)] lg:col-span-1"
              >
                {log.years.map((tick) => (
                  <span
                    key={tick.year}
                    className="absolute -inset-y-1 w-px bg-rule"
                    style={{ left: pct(tick.at) }}
                  />
                ))}
                <span
                  className="absolute inset-y-0"
                  style={{ left: pct(run.start), width: pct(run.length) }}
                >
                  {run.current ? (
                    <span className="absolute inset-0 bg-yellow blend shadow-[inset_0_0_0_1.5px_var(--color-blue)]" />
                  ) : (
                    <>
                      <span className="absolute inset-0 translate-x-[calc(var(--mis)*3px)] translate-y-[calc(var(--mis)*-2px)] bg-pink blend transition-[translate] duration-500 ease-snap" />
                      <span className="absolute inset-0 bg-blue blend" />
                    </>
                  )}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-3 slug">
        {log.runs.length} runs &nbsp;/&nbsp; up to {log.peak} on press at once
        &nbsp;/&nbsp; <span className="bg-yellow px-1 text-ink">yellow</span> is
        still running
      </p>
    </div>
  );
}
