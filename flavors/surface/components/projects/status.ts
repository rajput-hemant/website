import type { ProjectStatus } from "@/lib/data/types";

/** How each project status shows on a preset's lamp. Archived stays dark. */
export const lamp: Record<ProjectStatus, { on: boolean; pulse: boolean }> = {
  active: { on: true, pulse: false },
  maintained: { on: true, pulse: false },
  wip: { on: true, pulse: true },
  archived: { on: false, pulse: false },
};
