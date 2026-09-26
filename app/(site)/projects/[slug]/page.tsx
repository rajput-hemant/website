import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProjects } from "@/lib/data";
import { projectStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";
import { Page } from "@/components/site";
import {
  ArrowLink,
  Container,
  ExternalLink,
  PageHeader,
  RichText,
  Tag,
} from "@/components/ui";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getProjects()).find((item) => item.slug === slug);
  if (!project) return {};

  return pageMetadata({
    title: project.name,
    description: project.tagline,
    path: `/projects/${project.slug}`,
  });
}

/**
 * A minimal case-study shell for M1: header, tagline, description, stack,
 * links and a way back. The scroll-scrubbed case study (moments, media,
 * diagrams) arrives in M4.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = (await getProjects()).find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <Page>
      <Container className="py-section">
        <ArrowLink href="/projects" className="mb-8 inline-block">
          All projects
        </ArrowLink>

        <PageHeader
          eyebrow={`${project.year} · ${projectStatusLabels[project.status]}`}
          title={project.name}
          lede={project.tagline}
        />

        <RichText value={project.description} className="mt-8 max-w-[64ch]" />

        {project.stack.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-1.5" aria-label="Stack">
            {project.stack.map((name) => (
              <li key={name}>
                <Tag>{name}</Tag>
              </li>
            ))}
          </ul>
        )}

        {(project.github || project.live) && (
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-graphite">
            {project.github && (
              <li>
                <ExternalLink href={project.github}>GitHub</ExternalLink>
              </li>
            )}
            {project.live && (
              <li>
                <ExternalLink href={project.live}>Live</ExternalLink>
              </li>
            )}
          </ul>
        )}
      </Container>
    </Page>
  );
}
