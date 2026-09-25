import { projectStatusLabels } from "@/lib/data/labels";
import { type ProjectStatus as Status } from "@/lib/data/types";
import { cn } from "@/lib/utils";

// Filled accent for active, filled ink for maintained, a ring for work in progress, a faint ring when archived.
const dotClass: Record<Status, string> = {
  active: "bg-accent",
  maintained: "bg-muted",
  wip: "border border-accent",
  archived: "border border-subtle",
};

/** The status dot alone; pair it with the label, visible or `sr-only`. */
export function StatusDot({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full",
        dotClass[status],
        className
      )}
    />
  );
}

/** A small mono status label led by a dot whose fill tells the states apart. */
export function ProjectStatus({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 meta whitespace-nowrap",
        status === "archived" ? "text-subtle" : "text-muted",
        className
      )}
    >
      <StatusDot status={status} />
      {projectStatusLabels[status]}
    </span>
  );
}
