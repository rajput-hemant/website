import { permanentRedirect } from "next/navigation";

import { getProjects } from "@/lib/data";

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

/** This edition has no case-study pages; every project lives on /projects. */
export default function ProjectPage() {
  permanentRedirect("/projects");
}
