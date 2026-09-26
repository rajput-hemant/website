import Image from "next/image";

import { projectStatusLabels } from "@/lib/data/labels";
import { type Project } from "@/lib/data/types";
import { sharedElementName } from "@/lib/interaction/shared-element-name";
import { stackSlug } from "@/lib/projects/stack-slug";
import { cn } from "@/lib/utils";
import { SharedElement } from "@/components/interaction/shared-element";
import { Disclosure } from "@/components/ui/disclosure";
import { RichText } from "@/components/ui/portable-text";
import { Tag, TagList } from "@/components/ui/tag";

import { ProjectLinks } from "./project-links";
import styles from "./project-row.module.css";
import { ProjectStatus, StatusDot } from "./project-status";

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
 * `active:bg-surface` gives touch the same feedback a pointer gets from
 * hover (M11); `group/row` scopes the hover refinements in
 * project-row.module.css to this summary line only.
 */
export const rowSummaryClass = cn(
  "group/row -mx-3 rounded-md px-3 py-2 transition-colors duration-(--duration-exit) hover:bg-surface group-open/disclosure:hover:bg-transparent focus-visible:outline-offset-0 active:bg-surface",
  styles.row
);

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
            className="group/tag hit-area block rounded-sm focus-visible:outline-offset-1"
          >
            <Tag className="transition-colors duration-(--duration-exit) group-hover/tag:border-subtle group-hover/tag:text-foreground">
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
                archived && showStatus ? "text-muted" : "text-foreground",
                styles.name
              )}
            >
              {project.name}
            </span>
          </SharedElement>
          <span className="col-span-2 row-start-2 text-[0.9375rem] leading-snug text-muted sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:truncate sm:leading-[inherit] print:whitespace-normal">
            {project.tagline}
          </span>
          <span className="col-start-2 row-start-1 inline-flex items-center gap-2 font-mono text-2xs tracking-wide text-subtle tabular-nums transition-colors duration-(--duration-exit) [font-variation-settings:'wdth'_87.5] group-hover/row:text-foreground group-focus-visible/row:text-foreground sm:col-start-3">
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
      {project.image && (
        <Image
          src={project.image.url}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          sizes="(min-width: 42rem) 42rem, 100vw"
          loading="lazy"
          placeholder={project.image.blurDataUrl ? "blur" : "empty"}
          blurDataURL={project.image.blurDataUrl}
          className="aspect-[16/10] w-full rounded-md object-cover"
        />
      )}
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
