import type { Metadata } from "next";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { ProjectList } from "@/components/projects/project-list";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/site/section";
import { SectionHeading } from "@/components/ui/section-heading";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

function projectCount(count: number) {
  return `${count} ${count === 1 ? "project" : "projects"}`;
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);
  const more = projects.filter((project) => !project.featured);
  const years = projects.map((project) => project.year);
  const span =
    years.length > 0 ? `${Math.min(...years)}–${Math.max(...years)}` : null;

  return (
    <Container>
      <PageHeader
        title={page.title}
        description={page.description}
        meta={[projectCount(projects.length), span].filter(Boolean).join(" · ")}
      />

      {featured.length > 0 && (
        <Section aria-labelledby="featured" className="pt-0">
          <SectionHeading
            id="featured"
            eyebrow={projectCount(featured.length)}
            title="Featured"
          />
          <ProjectList projects={featured} />
        </Section>
      )}

      {more.length > 0 && (
        <Section aria-labelledby="more">
          <SectionHeading
            id="more"
            eyebrow={projectCount(more.length)}
            title={featured.length > 0 ? "More projects" : "All projects"}
          />
          <ProjectList projects={more} />
        </Section>
      )}
    </Container>
  );
}
