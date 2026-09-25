import { type Project } from "@/lib/data/types";
import { cn } from "@/lib/utils";

import { ProjectRow, type ProjectRowProps } from "./project-row";
import { stackSlug } from "./stack-slug";

export type ProjectListProps = Omit<ProjectRowProps, "project"> & {
  projects: Project[];
  className?: string;
};

/**
 * Projects as one-line rows. Each item carries its status and stack slugs, so
 * the /projects filter can hide rows without re-rendering them.
 */
export function ProjectList({
  projects,
  className,
  ...rowProps
}: ProjectListProps) {
  return (
    <ol className={cn("grid gap-px", className)}>
      {projects.map((project) => (
        <li
          key={project.id}
          data-project
          data-status={project.status}
          data-stack={project.stack.map(stackSlug).join(" ")}
        >
          <ProjectRow project={project} {...rowProps} />
        </li>
      ))}
    </ol>
  );
}
