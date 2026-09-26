import Link from "next/link";
import { gridRef, monthLabel, type Relief } from "@/flavors/survey/lib/relief";
import { cn } from "@/flavors/survey/lib/utils";

import type { Experience } from "@/lib/data/types";

/**
 * The summits in a table of heights, newest first: grid square, company and
 * role, the months it ran, and its height drawn to the same scale for every
 * role. Pointing at a row sends the loupe to that summit.
 */
export function Summits({
  relief,
  experience,
}: {
  relief: Relief;
  experience: Experience[];
}) {
  const byId = new Map(relief.summits.map((s) => [s.id, s]));
  const tallest = Math.max(1, ...relief.summits.map((s) => s.h));

  return (
    <ol className="border-t border-rule">
      {experience.map((role) => {
        const s = byId.get(role.id);
        if (!s) return null;
        return (
          <li
            key={role.id}
            data-scene-item={`role:${role.id}`}
            className="border-b border-rule"
          >
            <Link
              href={`/work#${role.id}`}
              className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-5 gap-y-1 py-5 sm:grid-cols-[4.5rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(8rem,14rem)]"
            >
              <span
                className={cn(
                  "font-sans text-lg font-semibold tracking-[0.08em] tabular-nums",
                  s.current ? "text-revision" : "text-ink-soft"
                )}
              >
                {gridRef(relief, s.x, s.p)}
              </span>
              <span className="min-w-0">
                <span className="spaced block text-[1.0625rem] tracking-[0.22em] transition-colors duration-200 fine:group-hover:text-water">
                  {role.company}
                </span>
                <span className="mt-1 block text-sm text-ink-soft">
                  {role.title}
                </span>
              </span>
              <span className="caps col-start-2 text-ink-faint sm:col-start-auto">
                {monthLabel(s.start)} to {s.current ? "now" : monthLabel(s.end)}
              </span>
              <span className="col-start-2 flex items-center gap-3 sm:col-start-auto">
                <span
                  aria-hidden
                  className="relative h-2 flex-1 border-b border-rule"
                >
                  <span
                    style={{ width: `${(s.h / tallest) * 100}%` }}
                    className={cn(
                      "absolute bottom-0 left-0 h-2",
                      s.current ? "bg-revision" : "bg-contour"
                    )}
                  />
                </span>
                <span className="w-24 text-right text-sm tabular-nums">
                  {s.h} months{s.current ? ", rising" : ""}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
