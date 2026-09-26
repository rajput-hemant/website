import type { Metadata } from "next";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { ProjectArchiveTable } from "@/components/projects/project-archive-table";
import { ProjectCard } from "@/components/projects/project-card";
import { Page, SceneSlot } from "@/components/site";
import { Container, PageHeader } from "@/components/ui";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

export default async function ProjectsPage() {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);
  const numberBySlug = new Map(
    projects.map((project, index) => [project.slug, index + 1])
  );

  return (
    <Page>
      <SceneSlot route="projects" />
      <Container className="py-section">
        <PageHeader
          eyebrow="Drawer 01 · Projects"
          title={page.title}
          lede={page.description}
        />

        {featured.length > 0 && (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                number={numberBySlug.get(project.slug) ?? 0}
              />
            ))}
          </ul>
        )}

        <div className="mt-16 sm:mt-20">
          <h2 className="font-display text-2xl text-paper">The archive</h2>
          <ProjectArchiveTable projects={projects} />
        </div>
      </Container>
    </Page>
  );
}
