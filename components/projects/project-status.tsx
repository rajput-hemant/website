import { type ProjectStatus as Status } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const statusLabel: Record<Status, string> = {
  active: "Active",
  maintained: "Maintained",
  wip: "In progress",
  archived: "Archived",
};

// Filled accent for active, filled ink for maintained, a ring for work in progress, a faint ring when archived.
const dotClass: Record<Status, string> = {
  active: "bg-accent",
  maintained: "bg-muted",
  wip: "border border-accent",
  archived: "border border-subtle",
};

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
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", dotClass[status])}
      />
      {statusLabel[status]}
    </span>
  );
}
