import { type Project } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { ExternalLink } from "@/components/ui/external-link";
import { TagList } from "@/components/ui/tag";

import { ProjectDetails } from "./project-details";
import { ProjectStatus } from "./project-status";

/** One project in the list: metadata line, name and links, tagline, stack, description. */
export function ProjectItem({ project }: { project: Project }) {
  const archived = project.status === "archived";

  return (
    <article
      id={project.slug}
      aria-labelledby={`${project.slug}-name`}
      className="py-8"
    >
      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 meta text-subtle">
        <span className="tabular-nums">{project.year}</span>
        <span aria-hidden>·</span>
        <ProjectStatus status={project.status} />
      </p>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3
          id={`${project.slug}-name`}
          className={cn(
            "display text-2xl",
            archived ? "text-muted" : "text-foreground"
          )}
        >
          {project.name}
        </h3>
        {(project.github || project.live) && (
          <ul className="flex items-center gap-x-5 text-sm text-muted">
            {project.github && (
              <li>
                <ExternalLink href={project.github}>
                  GitHub
                  <span className="sr-only">
                    {" "}
                    repository for {project.name}
                  </span>
                </ExternalLink>
              </li>
            )}
            {project.live && (
              <li>
                <ExternalLink href={project.live}>
                  Live
                  <span className="sr-only"> site for {project.name}</span>
                </ExternalLink>
              </li>
            )}
          </ul>
        )}
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
