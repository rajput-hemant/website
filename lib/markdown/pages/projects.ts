import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";

import { markdownDocument } from "../document";
import { projectSection } from "../fragments";

export async function projectsToMarkdown(): Promise<string> {
  const projects = await getProjects();
  const page = sitePage("/projects");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: projects.map((project) =>
      projectSection(project, { level: 2, description: true })
    ),
  });
}
