import type { ProjectStatus } from "@/lib/data/types";

export type ProjectFilter = {
  status: ProjectStatus | null;
  /** A `stackSlug`. */
  stack: string | null;
};

export const NO_FILTER: ProjectFilter = { status: null, stack: null };

const STATUSES: readonly ProjectStatus[] = [
  "active",
  "maintained",
  "wip",
  "archived",
];

const isStatus = (value: string | null): value is ProjectStatus =>
  value !== null && (STATUSES as readonly string[]).includes(value);

/**
 * Reads `#status=wip&stack=next`. Any other hash, such as a project anchor
 * (`#lipi`), is not a filter and reads as none.
 */
export function parseFilterHash(hash: string): ProjectFilter {
  const raw = hash.replace(/^#/, "");
  if (!raw.includes("=")) return NO_FILTER;
  const params = new URLSearchParams(raw);
  const status = params.get("status");
  const stack = params.get("stack")?.trim().toLowerCase() || null;
  return { status: isStatus(status) ? status : null, stack };
}

/** The hash for a filter, without `#`; empty when nothing is filtered. */
export function filterHash({ status, stack }: ProjectFilter): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (stack) params.set("stack", stack);
  return params.toString();
}

export function matchesFilter(
  project: { status: string; stacks: readonly string[] },
  { status, stack }: ProjectFilter
): boolean {
  return (
    (!status || project.status === status) &&
    (!stack || project.stacks.includes(stack))
  );
}
