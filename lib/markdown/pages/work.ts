import { sitePage } from "@/content/site";
import { getEducation, getExperience, getSkills } from "@/lib/data";

import { markdownDocument } from "../document";
import { escapeText } from "../escape";
import { educationList, roleSection, skillsList } from "../fragments";

export async function workToMarkdown(): Promise<string> {
  const [experience, skills, education] = await Promise.all([
    getExperience(),
    getSkills(),
    getEducation(),
  ]);
  const page = sitePage("/work");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: [
      "## Experience",
      ...experience.map((role) =>
        [
          roleSection(role, { level: 3, body: true }),
          role.note && `*Why it mattered:* ${escapeText(role.note)}`,
        ]
          .filter(Boolean)
          .join("\n\n")
      ),
      skills.length > 0 && "## Skills",
      skills.length > 0 && skillsList(skills),
      education.length > 0 && "## Education",
      education.length > 0 && educationList(education),
    ],
  });
}
