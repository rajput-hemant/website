import { type Project } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { TagList } from "@/components/ui/tag";

import { ProjectDetails } from "./project-details";
import { ProjectLinks } from "./project-links";
import { ProjectStatus } from "./project-status";

/** One project in the list: metadata line, name and links, tagline, stack, description. */
export function ProjectItem({ project }: { project: Project }) {
  const archived = project.status === "archived";

  return (
    <article
      id={project.slug}
      aria-labelledby={`${project.slug}-name`}
      className="py-7 sm:py-8"
    >
      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 meta text-subtle">
        <span className="tabular-nums">{project.year}</span>
        <span aria-hidden>·</span>
        <ProjectStatus status={project.status} />
      </p>
      <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3
          id={`${project.slug}-name`}
          className={cn(
            "display text-2xl",
            archived ? "text-muted" : "text-foreground"
          )}
        >
          {project.name}
        </h3>
        <ProjectLinks project={project} className="text-sm text-muted" />
      </div>
      <p className="mt-2 max-w-[56ch] text-muted">{project.tagline}</p>
      {project.stack.length > 0 && (
        <TagList tags={project.stack} className="mt-4" />
      )}
      <ProjectDetails
        name={project.name}
        description={project.description}
        className="mt-5"
      />
    </article>
  );
}
