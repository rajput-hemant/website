import { sitePage } from "@/content/site";
import { getEducation, getProfile, getSkills } from "@/lib/data";

import { markdownDocument, metaLine } from "../document";
import { escapeText, link } from "../escape";
import { educationList, skillsList } from "../fragments";
import { portableTextToMarkdown } from "../portable-text";

export async function aboutToMarkdown(): Promise<string> {
  const [profile, skills, education] = await Promise.all([
    getProfile(),
    getSkills(),
    getEducation(),
  ]);
  const page = sitePage("/about");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: [
      portableTextToMarkdown(profile.bio),
      metaLine([
        profile.location && escapeText(profile.location),
        profile.availability && escapeText(profile.availability),
      ]),
      skills.length > 0 && "## Skills",
      skills.length > 0 && skillsList(skills),
      education.length > 0 && "## Education",
      education.length > 0 && educationList(education),
      "## Contact",
      metaLine([
        link(profile.email, `mailto:${profile.email}`),
        ...profile.links.map((entry) => link(entry.label, entry.url)),
      ]),
    ],
  });
}
