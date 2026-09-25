"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { ChevronDown } from "lucide-react";

import { projectStatusLabels } from "@/lib/data/labels";
import type { ProjectStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

import {
  filterHash,
  matchesFilter,
  NO_FILTER,
  parseFilterHash,
  type ProjectFilter as Filter,
} from "./filter-hash";

export type StackOption = { slug: string; name: string; count: number };

export type ProjectFilterProps = {
  /** Id of the element holding the `[data-project]` rows and `[data-project-group]` sections. */
  scope: string;
  /** Every project's status and stack slugs, to count matches without reading the DOM. */
  projects: readonly { status: ProjectStatus; stacks: readonly string[] }[];
  statuses: readonly ProjectStatus[];
  stacks: readonly StackOption[];
};

const ALL = "all";

/** Picking the pressed item again empties the group; that reads as "All". */
const isStatusValue = (value: string | undefined): value is ProjectStatus =>
  value !== undefined && value !== ALL;

/** Fired after the filter rewrites the hash, which replaceState does silently. */
const FILTER_EVENT = "project-filter";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener(FILTER_EVENT, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(FILTER_EVENT, onChange);
  };
}

const getHash = () => window.location.hash;
// The page is static: the server knows no hash, so it renders every project.
const getServerHash = () => "";

/** Shows only the rows that match, and hides a group left empty. */
function applyFilter(scope: HTMLElement, filter: Filter) {
  for (const row of scope.querySelectorAll<HTMLElement>("[data-project]")) {
    row.hidden = !matchesFilter(
      {
        status: row.dataset.status ?? "",
        stacks: (row.dataset.stack ?? "").split(" "),
      },
      filter
    );
  }
  for (const group of scope.querySelectorAll<HTMLElement>(
    "[data-project-group]"
  )) {
    group.hidden = group.querySelector("[data-project]:not([hidden])") === null;
  }
}

const segmentClass =
  "h-7 rounded-[calc(var(--radius-md)-2px)] px-2.5 text-xs whitespace-nowrap text-muted transition-colors duration-(--duration-exit) hover:text-foreground focus-visible:outline-offset-0 data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-[0_0_0_1px_var(--color-border)]";

/**
 * Filters /projects by status and stack, entirely in the browser: the page
 * stays static, the state lives in the URL hash (`#status=wip&stack=next`) so
 * it can be shared, and stack tags inside the rows link straight to it.
 */
export function ProjectFilter({
  scope,
  projects,
  statuses,
  stacks,
}: ProjectFilterProps) {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);
  const filter = useMemo(() => parseFilterHash(hash), [hash]);
  const barRef = useRef<HTMLDivElement>(null);
  const visible = projects.filter((project) =>
    matchesFilter(project, filter)
  ).length;

  useEffect(() => {
    const root = document.getElementById(scope);
    if (root) applyFilter(root, filter);
  }, [scope, filter]);

  // A stack tag deep in the list was clicked: bring the filter into view.
  useEffect(() => {
    const reveal = () => {
      const bar = barRef.current;
      if (bar && bar.getBoundingClientRect().top < 0) {
        bar.scrollIntoView({ block: "start" });
      }
    };
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);

  function update(next: Filter) {
    const nextHash = filterHash(next);
    const { pathname, search } = window.location;
    window.history.replaceState(
      window.history.state,
      "",
      nextHash ? `#${nextHash}` : `${pathname}${search}`
    );
    window.dispatchEvent(new Event(FILTER_EVENT));
  }

  const total = projects.length;
  const filtered = filter.status !== null || filter.stack !== null;
  const knownStack = stacks.some((option) => option.slug === filter.stack);

  return (
    <div ref={barRef} data-print-hide className="grid gap-4">
      <div
        role="group"
        aria-label="Filter projects"
        className="flex flex-wrap items-center gap-x-4 gap-y-3"
      >
        <ToggleGroup
          aria-label="Status"
          value={[filter.status ?? ALL]}
          onValueChange={(values: string[]) => {
            const picked = values[0];
            update({
              ...filter,
              status: isStatusValue(picked) ? picked : null,
            });
          }}
          className="flex max-w-full flex-wrap gap-0.5 rounded-md border border-hairline bg-surface p-0.5"
        >
          <Toggle value={ALL} className={segmentClass}>
            All
          </Toggle>
          {statuses.map((status) => (
            <Toggle key={status} value={status} className={segmentClass}>
              {projectStatusLabels[status]}
            </Toggle>
          ))}
        </ToggleGroup>

        <label className="relative inline-flex items-center">
          <span className="sr-only">Stack</span>
          <select
            value={filter.stack ?? ""}
            onChange={(event) =>
              update({ ...filter, stack: event.target.value || null })
            }
            className={cn(
              "h-8 max-w-[14rem] appearance-none rounded-md border border-hairline bg-surface py-0 pr-8 pl-2.5 text-xs transition-colors duration-(--duration-exit) hover:border-border focus-visible:outline-offset-0 pointer-coarse:h-10",
              filter.stack ? "text-foreground" : "text-muted"
            )}
          >
            <option value="">Any stack</option>
            {filter.stack && !knownStack && (
              <option value={filter.stack}>{filter.stack}</option>
            )}
            {stacks.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name} ({option.count})
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            strokeWidth={1.75}
            className="pointer-events-none absolute right-2.5 size-3.5 text-subtle"
          />
        </label>

        <p
          aria-live="polite"
          className="meta text-subtle tabular-nums sm:ml-auto"
        >
          {filtered ? `${visible} of ${total}` : `${total} projects`}
        </p>
      </div>

      {filtered && visible === 0 && (
        <p className="text-sm text-muted">
          Nothing matches that filter.{" "}
          <button
            type="button"
            onClick={() => update(NO_FILTER)}
            className="link text-foreground"
          >
            Clear it
          </button>
        </p>
      )}
    </div>
  );
}
