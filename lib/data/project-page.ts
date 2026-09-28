import type { Metadata } from "next";

import { getProjects } from "@/lib/data";
import type { Project } from "@/lib/data/types";
import { pageMetadata } from "@/lib/metadata";

export async function projectStaticParams(): Promise<{ slug: string }[]> {
  const projects = await getProjects();
  return projects.map(({ slug }) => ({ slug }));
}

export async function projectMetadata(slug: string): Promise<Metadata> {
  const project = (await getProjects()).find((item) => item.slug === slug);
  if (!project) return {};
  return pageMetadata({
    title: project.name,
    description: project.tagline,
    path: `/projects/${project.slug}`,
  });
}

export async function loadProjectPage(
  slug: string,
  order?: (projects: Project[]) => Project[]
): Promise<{
  project: Project;
  projects: Project[];
  index: number;
  previous: Project | undefined;
  next: Project | undefined;
} | null> {
  const source = await getProjects();
  const projects = order ? order(source) : source;
  const index = projects.findIndex((item) => item.slug === slug);
  const project = projects[index];
  if (!project) return null;
  return {
    project,
    projects,
    index,
    previous: projects[index - 1],
    next: projects[index + 1],
  };
}
