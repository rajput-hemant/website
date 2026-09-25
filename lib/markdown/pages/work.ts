import { getEducation, getExperience, getSkills } from "@/lib/data";

import { markdownDocument } from "../document";
import { educationList, roleSection, skillsList } from "../fragments";
import { pageInfo } from "./page-info";

export async function workToMarkdown(): Promise<string> {
  const [experience, skills, education] = await Promise.all([
    getExperience(),
    getSkills(),
    getEducation(),
  ]);
  const page = pageInfo("/work");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: [
      "## Experience",
      ...experience.map((role) => roleSection(role, { level: 3, body: true })),
      skills.length > 0 && "## Skills",
      skills.length > 0 && skillsList(skills),
      education.length > 0 && "## Education",
      education.length > 0 && educationList(education),
    ],
  });
}
