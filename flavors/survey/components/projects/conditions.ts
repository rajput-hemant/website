import type { ProjectStatus } from "@/lib/data/types";

/** A project's status in survey terms: its condition on the ground. */
export const conditions: Record<
  ProjectStatus,
  { label: string; note?: string; className: string }
> = {
  active: { label: "In use", className: "text-wood" },
  maintained: { label: "Maintained", className: "text-wood" },
  wip: {
    label: "In progress",
    note: "under construction",
    className: "text-contour-ink",
  },
  archived: {
    label: "Archived",
    note: "(site of)",
    className: "text-ink-faint",
  },
};
