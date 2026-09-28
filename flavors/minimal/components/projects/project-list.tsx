import { stackSlug } from "@/flavors/minimal/lib/projects/stack-slug";
import { cn } from "@/flavors/minimal/lib/utils";

import { type Project } from "@/lib/data/types";

import styles from "./project-list.module.css";
import { ProjectRow, type ProjectRowProps } from "./project-row";

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
    <ol className={cn("grid gap-px", styles.list, className)}>
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
