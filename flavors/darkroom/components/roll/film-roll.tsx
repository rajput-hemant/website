import Link from "next/link";
import { pad2, STOCK, type RollFrame } from "@/flavors/darkroom/lib/roll";
import { cn } from "@/flavors/darkroom/lib/utils";

import { formatMonthYear } from "@/lib/format";

/**
 * The experience roll: one strip of film, one frame per role, oldest first
 * as a roll is shot. The start date is printed on the rebate like a dated
 * edge code; the role running now carries a grease tag. Scrolls sideways
 * where it doesn't fit.
 */
export function FilmRoll({
  frames,
  hrefFor,
  className,
}: {
  frames: readonly RollFrame[];
  hrefFor: (id: string) => string;
  className?: string;
}) {
  const ordered = [...frames].sort((a, b) => a.n - b.n);
  return (
    <div
      className={cn(
        "-mx-gutter overflow-x-auto overscroll-x-contain px-gutter pt-5 pb-2",
        className
      )}
    >
      <ol
        aria-label="Roles, oldest first"
        className="perfs grid w-max min-w-full auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-x-1.5 px-2 py-6.5"
      >
        {ordered.map(({ role, n, code, current, tenure }) => (
          <li
            key={role.id}
            data-scene-item={`role:${role.id}`}
            className="relative"
          >
            <p
              aria-hidden
              className="flex justify-between px-1 pb-1.5 edge text-[0.6875rem] text-edge-ink"
            >
              <span>{n % 2 ? STOCK : ""}</span>
              <span>{code}</span>
            </p>
            <Link
              href={hrefFor(role.id)}
              className="group/frame grid aspect-[3/2] min-h-40 content-between bg-img-lo p-4 text-img-hi ring-grease transition-shadow duration-(--duration-ui) fine:hover:ring-2"
            >
              <span className="edge text-[0.75rem] text-img-hi opacity-80">
                Frame {pad2(n)}
                <span className="sr-only">:</span>
              </span>
              <span className="grid gap-1.5">
                <span className="text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-none font-bold tracking-[-0.04em]">
                  {role.company}
                </span>
                <span className="text-sm leading-snug font-medium">
                  {role.title}
                </span>
                <span className="edge text-[0.75rem] text-img-hi opacity-80">
                  {formatMonthYear(role.startDate)} to{" "}
                  {role.endDate ? formatMonthYear(role.endDate) : "now"}
                </span>
              </span>
            </Link>
            <p
              aria-hidden
              className="flex justify-between px-1 pt-1.5 edge text-[0.6875rem] text-edge-ink"
            >
              <span>▸{n}</span>
              <span>{tenure}</span>
            </p>
            {current ? (
              <span
                aria-hidden
                className="pointer-events-none absolute top-7 -right-1 -rotate-6 hand text-[0.8125rem] leading-none"
              >
                now
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
