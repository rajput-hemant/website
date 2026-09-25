import type { Project, ProjectStatus } from "@/lib/data/types";
import { ExternalLink } from "@/components/ui/external-link";
import { TagList } from "@/components/ui/tag";

import { HomeSection } from "./home-section";

const MAX_PROJECTS = 4;
const MAX_TAGS = 3;

const statusLabel: Partial<Record<ProjectStatus, string>> = {
  wip: "In progress",
  archived: "Archived",
};

function ProjectItem({ project }: { project: Project }) {
  const href = project.live ?? project.github;
  const status = statusLabel[project.status];

  return (
    <article className="flex h-full flex-col border-t border-border pt-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-medium text-foreground">
          {href ? (
            <ExternalLink
              href={href}
              underline={false}
              className="hover:text-accent"
            >
              {project.name}
            </ExternalLink>
          ) : (
            project.name
          )}
        </h3>
        <p className="shrink-0 meta text-subtle">
          {status ? `${status} · ` : ""}
          {project.year}
        </p>
      </div>
      <p className="mt-1.5 text-sm text-muted">{project.tagline}</p>
      <div className="mt-auto grid gap-3 pt-4">
        <TagList tags={project.stack.slice(0, MAX_TAGS)} />
        {(project.github || project.live) && (
          <ul className="flex gap-4 meta text-muted">
            {project.github && (
              <li>
                <ExternalLink
                  href={project.github}
                  className="hover:text-foreground"
                >
                  Source
                  <span className="sr-only"> code for {project.name}</span>
                </ExternalLink>
              </li>
            )}
            {project.live && (
              <li>
                <ExternalLink
                  href={project.live}
                  className="hover:text-foreground"
                >
                  Live<span className="sr-only"> site for {project.name}</span>
                </ExternalLink>
              </li>
            )}
          </ul>
        )}
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
