import { getQuestion } from "@/lib/data";

import { askEntryToMarkdown, askToMarkdown } from "./pages/ask";
import { changelogToMarkdown } from "./pages/changelog";
import { homeToMarkdown } from "./pages/home";
import { labToMarkdown } from "./pages/lab";
import { nowToMarkdown } from "./pages/now";
import type { MirroredPath } from "./pages/page-info";
import { projectsToMarkdown } from "./pages/projects";
import { resumeToMarkdown } from "./pages/resume";
import { workToMarkdown } from "./pages/work";
import { getAllPublishedQuestions } from "./questions";
import { askEntrySlug, markdownSlug } from "./slugs";

export { markdownUrl } from "./document";
export { isMirrorSlug, markdownSlug } from "./slugs";
export { portableTextToMarkdown } from "./portable-text";
export {
  getAllPublishedQuestions,
  questionDate,
  questionExcerpt,
} from "./questions";

/** One builder per page in `content/site.ts` `pages`, keyed by page path. */
const pageBuilders = {
  "/": homeToMarkdown,
  "/work": workToMarkdown,
  "/projects": projectsToMarkdown,
  "/now": nowToMarkdown,
  "/changelog": changelogToMarkdown,
  "/resume": resumeToMarkdown,
  "/ask": askToMarkdown,
  "/lab": async () => labToMarkdown(),
} satisfies Record<MirroredPath, () => Promise<string>>;

const bySlug = new Map<string, () => Promise<string>>(
  Object.entries(pageBuilders).map(([path, build]) => [
    markdownSlug(path),
    build,
  ])
);

/** Every mirror slug: the fixed pages plus one per published /ask entry. */
export async function getMarkdownSlugs(): Promise<string[]> {
  const questions = await getAllPublishedQuestions();
  return [
    ...bySlug.keys(),
    ...questions.map((question) => `ask/${question.slug}`),
  ];
}

/** The markdown for a mirror slug (`index`, `work`, `ask/<slug>`…), or `null` when there is no such page. */
export async function renderMarkdown(slug: string): Promise<string | null> {
  const build = bySlug.get(slug);
  if (build) return build();

  const entrySlug = askEntrySlug(slug);
  if (!entrySlug) return null;
  const question = await getQuestion(entrySlug);
  return question ? askEntryToMarkdown(question) : null;
}
