import { glyphProps } from "@/flavors/minimal/components/scene/glyph";
import type { GlyphViewId } from "@/flavors/minimal/lib/scene/glyphs";
import { cn } from "@/flavors/minimal/lib/utils";

import { stackSlug } from "@/lib/data/stack-slug";
import type { Project } from "@/lib/data/types";

import styles from "./project-list.module.css";
import { ProjectRow, type ProjectRowProps } from "./project-row";

export type ProjectListProps = Omit<ProjectRowProps, "project" | "card"> & {
  projects: Project[];
  className?: string;
  /** Draw each row's index card as this 3D view (docs/minimal.md, "3D"). */
  sceneView?: GlyphViewId;
};

/**
 * Projects as one-line rows. Each item carries its status and stack slugs, so
 * the /projects filter can hide rows without re-rendering them.
 */
export function ProjectList({
  projects,
  className,
  sceneView,
  ...rowProps
}: ProjectListProps) {
  return (
    <ol
      {...(sceneView && glyphProps("cards", sceneView))}
      className={cn("grid gap-px", styles.list, className)}
    >
      {projects.map((project) => (
        <li
          key={project.id}
          data-project
          data-status={project.status}
          data-stack={project.stack.map(stackSlug).join(" ")}
          data-scene-item={`project:${project.slug}`}
        >
          <ProjectRow project={project} card={!!sceneView} {...rowProps} />
        </li>
      ))}
    </ol>
  );
}
