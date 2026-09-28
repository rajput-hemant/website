import Link from "next/link";
import { sortForGazetteer } from "@/flavors/survey/lib/gazetteer-order";
import type { Relief } from "@/flavors/survey/lib/relief";
import { cn } from "@/flavors/survey/lib/utils";

import type { Project } from "@/lib/data/types";

import { conditions } from "./conditions";
import { SiteSymbol } from "./site-symbol";

/** A 5 by 2 locator: the site's year column and its row band, lit in water blue. */
function Locator({ relief, year }: { relief: Relief; year: number }) {
  const cols = relief.to - relief.from;
  const w = 60 / cols;
  const i = year - relief.from;
  return (
    <svg aria-hidden viewBox="0 0 60 16" className="mt-2.5 block h-4 w-15">
      <rect x={i * w} y="8" width={w} height="8" className="fill-water" />
      <path
        d={`M0 .5H60M0 8H60M0 15.5H60${Array.from(
          { length: cols + 1 },
          (_, c) => `M${Math.min(59.5, Math.max(0.5, c * w))} 0V16`
        ).join("")}`}
        className="fill-none stroke-grid"
      />
    </svg>
  );
}

/**
 * Surveyed sites in grid order: symbol, name, what it was surveyed with,
 * its grid reference and a locator, and its condition. Rows carry
 * `data-condition` for the filter and `data-scene-item` so pointing at one
 * sends the loupe to the site.
 */
export function Gazetteer({
  relief,
  projects,
  id,
  className,
}: {
  relief: Relief;
  projects: Project[];
  id?: string;
  className?: string;
}) {
  const refOf = new Map(relief.sites.map((s) => [s.slug, s]));
  const rows = sortForGazetteer(projects, relief.sites);

  return (
    <ol id={id} className={cn("border-t border-rule", className)}>
      {rows.map((project) => {
        const site = refOf.get(project.slug);
        const condition = conditions[project.status];
        const gothic = project.status === "archived";
        return (
          <li
            key={project.id}
            data-condition={project.status}
            data-scene-item={`site:${project.slug}`}
            className="group grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-rule py-7 transition-colors duration-200 md:grid-cols-[2.5rem_minmax(0,1.7fr)_minmax(0,1fr)_8.5rem_9.5rem] md:gap-x-7 fine:hover:bg-[linear-gradient(90deg,var(--color-highlight),transparent_70%)]"
          >
            <SiteSymbol status={project.status} className="mt-1.5" />
            <div className="min-w-0">
              <h3
                className={cn(
                  "text-h3 leading-tight",
                  gothic ? "font-gothic text-[1.875rem]" : "font-display"
                )}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="underline decoration-transparent underline-offset-[0.2em] transition-[text-decoration-color] duration-200 fine:group-hover:decoration-contour"
                >
                  {project.name}
                </Link>
                {condition.note ? (
                  <small className="ml-2 font-serif text-base text-ink-soft italic">
                    {condition.note}
                  </small>
                ) : null}
              </h3>
              <p className="mt-2 max-w-[44ch] text-ink-soft">
                {project.tagline}
              </p>
            </div>
            <dl className="max-md:col-start-2">
              <dt className="caps text-ink-faint">Surveyed with</dt>
              <dd className="mt-1.5 text-sm">{project.stack.join(", ")}</dd>
            </dl>
            <div className="flex items-end gap-6 max-md:col-start-2 md:block">
              <dl>
                <dt className="caps text-ink-faint">Grid ref</dt>
                <dd className="mt-1.5 font-sans text-[1.375rem] leading-none font-semibold tracking-[0.08em] tabular-nums transition-colors duration-200 fine:group-hover:text-water">
                  {site?.ref ??
                    (project.year != null ? String(project.year) : "—")}
                </dd>
              </dl>
              {project.year != null ? (
                <Locator relief={relief} year={project.year} />
              ) : null}
            </div>
            <dl className="max-md:col-start-2">
              <dt className="caps text-ink-faint">Condition</dt>
              <dd
                className={cn(
                  "mt-1.5 text-sm font-medium",
                  condition.className
                )}
              >
                {condition.label}
                {project.year != null && project.status !== "archived"
                  ? `, since ${project.year}`
                  : null}
              </dd>
            </dl>
          </li>
        );
      })}
    </ol>
  );
}
