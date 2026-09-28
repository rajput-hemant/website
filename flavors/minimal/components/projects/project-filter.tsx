"use client";

import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";
import { ChevronDown } from "lucide-react";

import { projectStatusLabels } from "@/lib/data/labels";

import {
  barClass,
  chevronClass,
  countClass,
  groupClass,
  segmentClass,
  segmentFlexClass,
  selectClass,
  selectLabelClass,
  toggleGroupClass,
  toolsClass,
} from "./project-filter-classes";
import type {
  ProjectFilterControls,
  ProjectFilterProps,
} from "./project-filter-controls";

export type {
  ProjectFilterProps,
  StackOption,
} from "./project-filter-controls";

type Controls = typeof ProjectFilterControls;

/**
 * The /projects filter. Its Base UI toggle group loads after hydration;
 * until then (and for visitors without JavaScript, who see every project)
 * a static copy of the unfiltered bar holds the same space, so nothing
 * shifts when the real one swaps in.
 */
export function ProjectFilter(props: ProjectFilterProps) {
  const [Controls, setControls] = React.useState<Controls | null>(null);
  const placeholderRef = React.useRef<HTMLDivElement>(null);
  const hadFocus = React.useRef(false);

  React.useEffect(() => {
    let active = true;
    void import("./project-filter-controls").then((mod) => {
      if (!active) return;
      // The stand-in's select is focusable; hand focus to the real one.
      hadFocus.current =
        placeholderRef.current?.contains(document.activeElement) ?? false;
      setControls(() => mod.ProjectFilterControls);
    });
    return () => {
      active = false;
    };
  }, []);

  React.useLayoutEffect(() => {
    if (!Controls || !hadFocus.current) return;
    hadFocus.current = false;
    document
      .querySelector<HTMLElement>("[data-project-filter] select")
      ?.focus();
  }, [Controls]);

  return Controls ? (
    <Controls {...props} />
  ) : (
    <FilterPlaceholder ref={placeholderRef} {...props} />
  );
}

/** The server render of the filter with no hash: "All" pressed, any stack. */
function FilterPlaceholder({
  ref,
  projects,
  statuses,
  stacks,
}: ProjectFilterProps & { ref: React.Ref<HTMLDivElement> }) {
  const toggles = [
    { value: "all", label: "All" },
    ...statuses.map((status) => ({
      value: status,
      label: projectStatusLabels[status],
    })),
  ];

  return (
    <div ref={ref} data-project-filter data-print-hide className={barClass}>
      <div role="group" aria-label="Filter projects" className={groupClass}>
        <div
          data-orientation="horizontal"
          role="group"
          aria-label="Status"
          className={toggleGroupClass}
        >
          {toggles.map(({ value, label }, index) => (
            <button
              key={value}
              type="button"
              tabIndex={-1}
              aria-disabled="false"
              aria-pressed={index === 0}
              {...(index === 0 && { "data-pressed": "" })}
              className={cn(segmentClass, segmentFlexClass)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={toolsClass}>
          <label className={selectLabelClass}>
            <span className="sr-only">Stack</span>
            <select defaultValue="" className={cn(selectClass, "text-muted")}>
              <option value="">Any stack</option>
              {stacks.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name} ({option.count})
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              strokeWidth={1.75}
              className={chevronClass}
            />
          </label>

          <p aria-live="polite" className={countClass}>
            {`${projects.length} projects`}
          </p>
        </div>
      </div>
    </div>
  );
}
