import { sitePage } from "@/content/site";
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/data";
import { hostedResumeLabel } from "@/components/resume/hosted-resume";

import { bulletList, markdownDocument, metaLine } from "../document";
import { escapeText, link } from "../escape";
import {
  educationList,
  projectSummary,
  roleSection,
  skillsList,
} from "../fragments";

export async function resumeToMarkdown(): Promise<string> {
  const [profile, experience, projects, skills, education] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getSkills(),
    getEducation(),
  ]);
  const page = sitePage("/resume");
  const featured = projects.filter((project) => project.featured);

  return markdownDocument({
    title: `${profile.name}: ${page.title}`,
    path: page.path,
    summary: profile.headline,
    sections: [
      metaLine([
        escapeText(profile.location),
        link(profile.email, `mailto:${profile.email}`),
        ...profile.links.map((entry) => link(entry.label, entry.url)),
      ]),
      profile.resumeUrl &&
        link(
          `Also on ${hostedResumeLabel(profile.resumeUrl)} ↗`,
          profile.resumeUrl
        ),
      profile.resumeNote && escapeText(profile.resumeNote, true),
      "## Experience",
      ...experience.map((role) =>
        roleSection(role, { level: 3, body: role.highlights.length === 0 })
      ),
      featured.length > 0 && "## Selected projects",
      bulletList(featured.map(projectSummary)),
      skills.length > 0 && "## Skills",
      skills.length > 0 && skillsList(skills),
      education.length > 0 && "## Education",
      education.length > 0 && educationList(education),
    ],
  });
}
