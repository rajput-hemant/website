import { labExperiments } from "@/content/lab";
import { pages, site } from "@/content/site";
import { getProfile } from "@/lib/data";
import { absoluteUrl } from "@/lib/url";

import { bulletList, markdownUrl } from "./document";
import { breakAutolinks, codeSpan, escapeText, heading, link } from "./escape";
import { getAllPublishedQuestions, questionExcerpt } from "./questions";

function entry(label: string, url: string, note: string): string {
  return `${link(label, url)}: ${escapeText(note)}`;
}

/**
 * The site index in the llms.txt format (https://llmstxt.org): title, summary,
 * a short orientation, then link lists pointing at the markdown mirrors.
 */
export async function llmsTxt(): Promise<string> {
  const [profile, questions] = await Promise.all([
    getProfile(),
    getAllPublishedQuestions(),
  ]);

  const optional = [
    ...labExperiments.map((experiment) =>
      entry(
        `Lab: ${experiment.title}`,
        absoluteUrl(`/lab/${experiment.slug}`),
        `${experiment.description} (interactive WebGL, HTML only)`
      )
    ),
    ...questions.map((question) =>
      entry(
        `Ask: ${breakAutolinks(questionExcerpt(question))}`,
        markdownUrl(`/ask/${question.slug}`),
        question.replies.length > 0
          ? "A conversation with visitors"
          : question.by === "owner"
            ? "A note from me"
            : "A visitor's message"
      )
    ),
  ];

  const sections = [
    heading(1, escapeText(profile.name, true)),
    `> ${escapeText(site.description)}`,
    `${escapeText(profile.headline, true)}, based in ${escapeText(profile.location)}. Every page has a markdown mirror: add ${codeSpan(".md")} to its path (the home page is ${codeSpan("/index.md")}), or request the page with ${codeSpan("Accept: text/markdown")}.`,
    heading(2, "Pages"),
    bulletList(
      pages.map((page) =>
        entry(page.title, markdownUrl(page.path), page.description)
      )
    ),
    heading(2, "Contact"),
    bulletList([
      link("Email", `mailto:${profile.email}`),
      ...profile.links.map((profileLink) =>
        link(profileLink.label, profileLink.url)
      ),
    ]),
    optional.length > 0 && heading(2, "Optional"),
    optional.length > 0 && bulletList(optional),
  ];

  return `${sections.filter(Boolean).join("\n\n")}\n`;
}
