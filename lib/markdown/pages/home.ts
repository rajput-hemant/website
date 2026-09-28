import { pages } from "@/content/site";
import { getExperience, getNow, getProfile, getProjects } from "@/lib/data";

import { bulletList, markdownDocument, markdownUrl } from "../document";
import { escapeText, link } from "../escape";
import { nowAsOf, nowList, projectSummary, roleSummary } from "../fragments";
import { portableTextToMarkdown } from "../portable-text";

const SELECTED_PROJECTS = 4;
const RECENT_ROLES = 4;

export async function homeToMarkdown(): Promise<string> {
  const [profile, now, projects, experience] = await Promise.all([
    getProfile(),
    getNow(),
    getProjects(),
    getExperience(),
  ]);
  const selected = projects.filter((project) => project.featured);

  return markdownDocument({
    title: profile.name,
    path: "/",
    summary: profile.headline,
    sections: [
      portableTextToMarkdown(profile.bio),
      profile.availability && escapeText(profile.availability, true),
      `Based in ${escapeText(profile.location)}. Email: ${link(profile.email, `mailto:${profile.email}`)}`,
      "## Now",
      nowList(now),
      `${nowAsOf(now)} ${link("More on what I am doing now", markdownUrl("/now"))}`,
      selected.length > 0 && "## Selected projects",
      bulletList(selected.slice(0, SELECTED_PROJECTS).map(projectSummary)),
      selected.length > 0 && link("All projects", markdownUrl("/projects")),
      "## Experience",
      bulletList(experience.slice(0, RECENT_ROLES).map(roleSummary)),
      link("Full experience, skills and education", markdownUrl("/work")),
      profile.links.length > 0 && "## Elsewhere",
      bulletList(profile.links.map((entry) => link(entry.label, entry.url))),
      "## Pages",
      bulletList(
        pages
          .filter((page) => page.path !== "/")
          .map(
            (page) =>
              `${link(page.title, markdownUrl(page.path))}: ${escapeText(page.description)}`
          )
      ),
    ],
  });
}
