import { getProjects } from "@/lib/data";

import { markdownDocument } from "../document";
import { projectSection } from "../fragments";
import { pageInfo } from "./page-info";

export async function projectsToMarkdown(): Promise<string> {
  const projects = await getProjects();
  const page = pageInfo("/projects");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: projects.map((project) =>
      projectSection(project, { level: 2, description: true })
    ),
  });
}
