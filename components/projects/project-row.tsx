import { projectStatusLabels } from "@/lib/data/labels";
import { type Project } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { SharedElement } from "@/components/interaction/shared-element";
import { sharedElementName } from "@/components/interaction/shared-element-name";
import { RichText } from "@/components/portable-text";
import { Disclosure } from "@/components/ui/disclosure";
import { Tag, TagList } from "@/components/ui/tag";

import { ProjectLinks } from "./project-links";
import { ProjectStatus, StatusDot } from "./project-status";
import { stackSlug } from "./stack-slug";

export type ProjectRowProps = {
  project: Project;
  /** Give the row the project's slug as its anchor, so `#slug` opens it. */
  anchored?: boolean;
  /** Show the status dot beside the year. */
  showStatus?: boolean;
  /** Turn stack tags into `#stack=` filter links (the /projects page). */
  filterLinks?: boolean;
};

/**
 * Shared by every list row that opens in place: a hover fill that reaches a
 * little past the text column, and a focus ring drawn on the fill's edge.
 */
export const rowSummaryClass =
  "-mx-3 rounded-md px-3 py-2 transition-colors duration-150 hover:bg-surface focus-visible:outline-offset-0 group-open/disclosure:hover:bg-transparent";

function StackTags({
  stack,
  filterLinks,
}: {
  stack: readonly string[];
  filterLinks: boolean;
}) {
  if (stack.length === 0) return null;
  if (!filterLinks) return <TagList tags={stack} />;

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
      {stack.map((name) => (
        <li key={name}>
          <a
            href={`#stack=${stackSlug(name)}`}
            aria-label={`Show projects built with ${name}`}
            className="group/tag block rounded-sm focus-visible:outline-offset-1"
          >
            <Tag className="transition-colors duration-150 group-hover/tag:border-subtle group-hover/tag:text-foreground">
              {name}
            </Tag>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * One project as a single line (name, tagline, year) that opens in place to
 * its write-up, stack and links. Below `sm` the tagline takes a second line
 * rather than being cut off.
 */
export function ProjectRow({
  project,
  anchored = false,
  showStatus = false,
  filterLinks = false,
}: ProjectRowProps) {
  const archived = project.status === "archived";

  return (
    <Disclosure
      id={anchored ? project.slug : undefined}
      chevron="end"
      summaryClassName={rowSummaryClass}
      contentClassName="grid gap-4 pt-2 pb-7"
      summary={
        <span className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
          <SharedElement name={sharedElementName("project", project.slug)}>
            <span
              className={cn(
                "inline-block font-medium",
                archived ? "text-muted" : "text-foreground"
              )}
            >
              {project.name}
            </span>
          </SharedElement>
          <span className="col-span-2 row-start-2 text-[0.9375rem] leading-snug text-muted sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:truncate sm:leading-[inherit] print:whitespace-normal">
            {project.tagline}
          </span>
          <span className="col-start-2 row-start-1 inline-flex items-center gap-2 font-mono text-2xs tracking-wide text-subtle tabular-nums [font-variation-settings:'wdth'_87.5] sm:col-start-3">
            {showStatus && (
              <>
                <StatusDot status={project.status} />
                <span className="sr-only">
                  {projectStatusLabels[project.status]},{" "}
                </span>
              </>
            )}
            {project.year}
          </span>
        </span>
      }
    >
      <RichText
        value={project.description}
        className="max-w-[62ch] text-[0.9375rem] text-muted [&_strong]:text-foreground"
      />
      <StackTags stack={project.stack} filterLinks={filterLinks} />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <ProjectStatus status={project.status} />
        <ProjectLinks project={project} className="text-sm text-muted" />
      </div>
    </Disclosure>
  );
}
