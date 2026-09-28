import { cn } from "@/flavors/survey/lib/utils";

import type { ProjectStatus } from "@/lib/data/types";

/**
 * The map symbol for a project's condition, as in the key: a trig pillar for
 * a maintained site, a cross for an antiquity, a dashed square for works
 * under construction.
 */
export function SiteSymbol({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 28 28"
      className={cn("size-7 overflow-visible text-ink", className)}
    >
      {status === "archived" ? (
        <path d="M8 14H20M14 8V20" stroke="currentColor" strokeWidth="1.4" />
      ) : status === "wip" ? (
        <rect
          x="5"
          y="5"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="4 3"
        />
      ) : (
        <>
          <path
            d="M14 3L25 23H3Z"
            fill={status === "active" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle
            cx="14"
            cy="16"
            r="2"
            className={status === "active" ? "fill-sheet" : "fill-current"}
          />
        </>
      )}
    </svg>
  );
}
