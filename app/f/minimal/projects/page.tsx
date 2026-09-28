import type { Metadata } from "next";
import {
  ProjectFilter,
  type StackOption,
} from "@/flavors/minimal/components/projects/project-filter";
import { ProjectList } from "@/flavors/minimal/components/projects/project-list";
import { Container } from "@/flavors/minimal/components/site/container";
import { PageHeader } from "@/flavors/minimal/components/site/page-header";
import { ExpandAll } from "@/flavors/minimal/components/ui/disclosure";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import { stackSlug } from "@/lib/data/stack-slug";
import type { Project, ProjectStatus } from "@/lib/data/types";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

const STATUS_ORDER: readonly ProjectStatus[] = [
  "active",
  "maintained",
  "wip",
  "archived",
];

/** "Expand all" earns its place only in longer lists. */
const EXPAND_ALL_MIN = 4;

function stackOptions(projects: Project[]): StackOption[] {
  const bySlug = new Map<string, StackOption>();
  for (const name of projects.flatMap((project) => project.stack)) {
    const slug = stackSlug(name);
    const option = bySlug.get(slug) ?? { slug, name, count: 0 };
    bySlug.set(slug, { ...option, count: option.count + 1 });
  }
  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

function ProjectGroup({
  id,
  title,
  projects,
}: {
  id: string;
  title: string;
  projects: Project[];
}) {
  if (projects.length === 0) return null;
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-project-group
      className="pt-12 first:pt-0 sm:pt-14"
    >
      <div className="mb-3 flex items-center justify-between gap-6 border-b border-hairline pb-3">
        <h2 id={headingId} className="meta text-subtle">
          {title}
          <span className="text-faint"> · </span>
          <span className="tabular-nums">{projects.length}</span>
        </h2>
        {projects.length >= EXPAND_ALL_MIN && <ExpandAll controls={id} />}
      </div>
      <ProjectList projects={projects} anchored showStatus filterLinks />
    </section>
  );
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);
  const more = projects.filter((project) => !project.featured);
  const years = projects.map((project) => project.year);
  const span =
    years.length > 0 ? `${Math.min(...years)}–${Math.max(...years)}` : null;
  const statuses = STATUS_ORDER.filter((status) =>
    projects.some((project) => project.status === status)
  );

  return (
    <Container className="stagger">
      <PageHeader
        title={page.title}
        description={page.description}
        meta={span && <span className="tabular-nums">{span}</span>}
      />

      {projects.length > 1 && (
        <div className="mb-12 sm:mb-14">
          <ProjectFilter
            scope="project-groups"
            projects={projects.map((project) => ({
              status: project.status,
              stacks: project.stack.map(stackSlug),
            }))}
            statuses={statuses}
            stacks={stackOptions(projects)}
          />
        </div>
      )}

      <div id="project-groups">
        <ProjectGroup
          id="featured-projects"
          title="Featured"
          projects={featured}
        />
        <ProjectGroup
          id="more-projects"
          title={featured.length > 0 ? "More" : "All projects"}
          projects={more}
        />
      </div>
    </Container>
  );
}
