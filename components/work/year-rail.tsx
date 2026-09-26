"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type YearMark = { year: string; targetId: string };

/**
 * A sticky mono tab list of the years the timeline spans. It is a real list
 * of `#role-id` links, so it works with no JS; once mounted, an
 * IntersectionObserver over each role's `[data-year]` article highlights the
 * year currently in view.
 */
export function YearRail({ years }: { years: YearMark[] }) {
  const [active, setActive] = React.useState(years[0]?.year);

  React.useEffect(() => {
    const articles = Array.from(
      document.querySelectorAll<HTMLElement>("[data-year]")
    );
    if (articles.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0];
        const year = visible?.target.getAttribute("data-year");
        if (year) setActive(year);
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    for (const article of articles) observer.observe(article);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Jump to year"
      className="sticky top-[calc(var(--header-height)+1.5rem)]"
    >
      <ul className="grid gap-1">
        {years.map(({ year, targetId }) => (
          <li key={year}>
            <a
              href={`#${targetId}`}
              aria-current={active === year ? "true" : undefined}
              className={cn(
                "block rounded-sm px-2 py-1 font-mono text-mono-xs tabular-nums transition-colors duration-(--duration-ui)",
                active === year
                  ? "text-accent"
                  : "text-ink-faint hover:text-ink"
              )}
            >
              {year}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
