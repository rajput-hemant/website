import Link from "next/link";
import { cn } from "@/flavors/jacquard/lib/utils";
import { yarnClass, type Loom } from "@/flavors/jacquard/lib/weave";

import { formatMonthYear } from "@/lib/format";

const pct = (n: number) => `${(n * 100).toFixed(3)}%`;
/** Where the thread sits in its lane, as a fraction of the lane's height. */
const THREAD_AT = 0.7;

/**
 * Roles as threads over time, on one month axis. Each colour is one thread
 * of work; where a team moved and I moved with it, the thread carries on
 * into the next role instead of ending, drawn as the curve between them.
 */
export function Threads({
  loom,
  hrefFor,
  className,
}: {
  loom: Loom;
  hrefFor: (id: string) => string;
  className?: string;
}) {
  const n = loom.rows.length;
  return (
    <div className={cn("min-w-0", className)}>
      <div className="relative">
        <ol>
          {loom.rows.map((row) => {
            const end = row.start + row.length;
            const right = row.start > 0.5;
            return (
              <li
                key={row.role.id}
                data-scene-item={`role:${row.role.id}`}
                className={cn("relative h-24 md:h-16", yarnClass[row.yarn])}
              >
                <Link
                  href={hrefFor(row.role.id)}
                  className={cn(
                    "group absolute top-0.5 flex max-w-full flex-col items-start gap-0 md:flex-row md:items-baseline md:gap-3 md:whitespace-nowrap",
                    "max-md:right-auto! max-md:left-0!",
                    right && "md:text-right"
                  )}
                  style={
                    right ? { right: pct(1 - end) } : { left: pct(row.start) }
                  }
                >
                  <b className="font-display text-xl leading-tight font-normal transition-colors duration-(--duration-ui) ease-out fine:group-hover:text-madder">
                    {row.role.company}
                  </b>
                  <span className="text-[0.8125rem] leading-snug text-ink-soft">
                    {row.role.title}
                  </span>
                  <time className="font-mono text-[0.65625rem] tracking-[0.06em] text-ink-faint">
                    {formatMonthYear(row.role.startDate)} to{" "}
                    {row.role.endDate
                      ? formatMonthYear(row.role.endDate)
                      : "now"}
                  </time>
                </Link>
                <i
                  aria-hidden
                  className="yarn absolute h-[5px] rounded-[3px]"
                  style={{
                    top: `calc(${THREAD_AT * 100}% - 2.5px)`,
                    left: pct(row.start),
                    width: pct(row.length),
                  }}
                />
              </li>
            );
          })}
        </ol>
        <svg
          aria-hidden
          viewBox={`0 0 100 ${n}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          {loom.carries.map((carry) => {
            const from = loom.rows[carry.from];
            const to = loom.rows[carry.to];
            if (!from || !to) return null;
            const x1 = (from.start + from.length) * 100;
            const x2 = to.start * 100;
            const y1 = carry.from + THREAD_AT;
            const y2 = carry.to + THREAD_AT;
            const bend = Math.max(1.2, Math.abs(x2 - x1) * 0.5 + 1);
            return (
              <path
                key={`${carry.from}-${carry.to}`}
                className={cn("fill-none stroke-(--y)", yarnClass[carry.yarn])}
                strokeWidth="5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                d={`M${x1 - 1.5} ${y1}C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2 + 1.5} ${y2}`}
              />
            );
          })}
        </svg>
      </div>
      <div
        aria-hidden
        className="relative mt-1 h-8 border-t border-rule font-mono text-label tracking-[0.06em] text-ink-faint uppercase"
      >
        <span className="absolute top-2 left-0">{loom.from}</span>
        {loom.years.map((tick) => (
          <span
            key={tick.year}
            className="absolute top-2 -translate-x-1/2 max-sm:hidden"
            style={{ left: pct(tick.at) }}
          >
            {tick.year}
          </span>
        ))}
        <span className="absolute top-2 right-0">Now</span>
      </div>
    </div>
  );
}
