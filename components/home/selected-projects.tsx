import Link from "next/link";

import type { Project, ProjectStatus as Status } from "@/lib/data/types";
import { SharedElement } from "@/components/interaction/shared-element";
import { sharedElementName } from "@/components/interaction/shared-element-name";
import { ProjectLinks } from "@/components/projects/project-links";
import { ProjectStatus } from "@/components/projects/project-status";
import { TagList } from "@/components/ui/tag";

import { HomeSection } from "./home-section";

const MAX_PROJECTS = 4;
const MAX_TAGS = 3;

/** Only statuses a visitor should know about before clicking are shown. */
const NOTED_STATUSES: readonly Status[] = ["wip", "archived"];

/** A compact entry; the name opens the project's full write-up on /projects. */
function ProjectItem({ project }: { project: Project }) {
  return (
    <article className="flex h-full flex-col border-t border-border pt-5">
      <div className="flex items-baseline justify-between gap-4">
        <SharedElement name={sharedElementName("project", project.slug)}>
          <h3 className="font-medium text-foreground">
            <Link
              href={`/projects#${project.slug}`}
              className="transition-colors duration-150 hover:text-accent"
            >
              {project.name}
            </Link>
          </h3>
        </SharedElement>
        <p className="flex shrink-0 items-center gap-2 meta text-subtle">
          {NOTED_STATUSES.includes(project.status) && (
            <>
              <ProjectStatus status={project.status} />
              <span aria-hidden>·</span>
            </>
          )}
          <span className="tabular-nums">{project.year}</span>
        </p>
      </div>
      <p className="mt-1.5 text-sm text-muted">{project.tagline}</p>
      <div className="mt-auto grid gap-3 pt-4">
        <TagList tags={project.stack.slice(0, MAX_TAGS)} />
        <ProjectLinks project={project} className="gap-x-4 meta text-muted" />
      </div>
    </article>
  );
}

export function SelectedProjects({ projects }: { projects: Project[] }) {
  const selected = projects.filter((p) => p.featured).slice(0, MAX_PROJECTS);
  if (selected.length === 0) return null;

  return (
    <HomeSection
      id="projects"
      title="Projects"
      link={{ href: "/projects", label: "All projects" }}
    >
      <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {selected.map((project) => (
          <li key={project.id}>
            <ProjectItem project={project} />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
