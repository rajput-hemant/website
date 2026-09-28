import { sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";

import { markdownDocument } from "../document";
import { escapeText } from "../escape";
import { roleSection } from "../fragments";

export async function workToMarkdown(): Promise<string> {
  const experience = await getExperience();
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
    ],
  });
}
