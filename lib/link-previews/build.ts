import { labExperiments } from "@/content/lab";
import { pages, site } from "@/content/site";
import {
  getChangelog,
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getQuestions,
} from "@/lib/data";
import type { Question } from "@/lib/data/types";

import { fetchLinkPreview, mapWithConcurrency } from "./fetch";
import { generatedOgImagePath } from "./og-image-path";
import type { LinkPreview, LinkPreviewMap } from "./types";
import { normalizeExternalUrl, richTextHrefs, withGithubFallback } from "./url";

const FETCH_CONCURRENCY = 6;
const QUESTIONS_PAGE_SIZE = 100;
const THREAD_TITLE_LENGTH = 90;

/** app/opengraph-image.tsx; pages without their own card inherit it. */
const SITE_CARD = generatedOgImagePath("/", "/");
/** app/(site)/ask/opengraph-image.tsx */
const ASK_CARD = generatedOgImagePath("/(site)/ask", "/ask");

/** A preview map must never fail the build, so a failing accessor contributes nothing. */
async function settle<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

async function allQuestions(): Promise<Question[]> {
  const questions: Question[] = [];
  for (let page = 1; ; page++) {
    const { items, total } = await getQuestions({
      page,
      pageSize: QUESTIONS_PAGE_SIZE,
    });
    questions.push(...items);
    if (items.length === 0 || questions.length >= total) return questions;
  }
}

/** Every external URL the site's content links to, deduplicated and normalised. */
export async function collectExternalUrls(): Promise<string[]> {
  const [profile, projects, experience, now, changelog] = await Promise.all([
    settle(getProfile(), null),
    settle(getProjects(), []),
    settle(getExperience(), []),
    settle(getNow(), null),
    settle(getChangelog(), []),
  ]);

  const candidates = [
    ...(profile?.links.map((link) => link.url) ?? []),
    ...richTextHrefs(profile?.bio),
    ...projects.flatMap((project) => [
      project.github,
      project.live,
      ...richTextHrefs(project.description),
    ]),
    ...experience.flatMap((entry) => [
      entry.companyUrl,
      ...richTextHrefs(entry.body),
    ]),
    ...(now?.items.map((item) => item.link) ?? []),
    ...changelog.map((update) => update.link),
  ];

  const ownHost = new URL(site.url).host;
  const urls = new Set<string>();
  for (const candidate of candidates) {
    const url = candidate && normalizeExternalUrl(candidate);
    if (url && new URL(url).host !== ownHost) urls.add(url);
  }
  return [...urls].sort();
}

function threadTitle(question: Question): string {
  const text = question.body.replace(/\s+/g, " ").trim();
  return text.length <= THREAD_TITLE_LENGTH
    ? text
    : `${text.slice(0, THREAD_TITLE_LENGTH - 1).trimEnd()}…`;
}

function threadDescription(question: Question): string {
  const author = question.authorName ?? "Anonymous";
  const replies = question.replies.length;
  const count =
    replies === 0 ? "" : ` · ${replies} ${replies === 1 ? "reply" : "replies"}`;
  return `${author} on the ask page${count}`;
}

/** Cards for the site's own pages, using their generated Open Graph images. */
export async function collectInternalPreviews(): Promise<LinkPreviewMap> {
  const map: LinkPreviewMap = {};

  for (const page of pages) {
    map[page.path] = {
      title: page.title,
      description: page.description,
      image: page.path === "/ask" ? ASK_CARD : SITE_CARD,
    };
  }

  for (const experiment of labExperiments) {
    map[`/lab/${experiment.slug}`] = {
      title: experiment.title,
      description: experiment.description,
      image: SITE_CARD,
    };
  }

  for (const question of await settle(allQuestions(), [])) {
    map[`/ask/${question.slug}`] = {
      title: threadTitle(question),
      description: threadDescription(question),
      // app/(site)/ask/[slug]/opengraph-image.tsx
      image: generatedOgImagePath(
        "/(site)/ask/[slug]",
        `/ask/${question.slug}`
      ),
    };
  }

  return map;
}

/** Fetches every external page once; unreachable pages keep a text-only entry. */
export async function collectExternalPreviews(): Promise<LinkPreviewMap> {
  const urls = await collectExternalUrls();
  const previews = await mapWithConcurrency(
    urls,
    FETCH_CONCURRENCY,
    async (url): Promise<[string, LinkPreview]> => [
      url,
      withGithubFallback(url, await fetchLinkPreview(url)),
    ]
  );
  return Object.fromEntries(previews);
}

export async function buildLinkPreviewMap(): Promise<LinkPreviewMap> {
  const [internal, external] = await Promise.all([
    collectInternalPreviews(),
    collectExternalPreviews(),
  ]);
  return { ...external, ...internal };
}
