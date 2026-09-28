import type { Metadata } from "next";

import { excerpt } from "@/lib/ask/format";
import { isSlug } from "@/lib/ask/slug";
import { getQuestions } from "@/lib/data";
import {
  findPublishedQuestion,
  getAllPublishedQuestions,
} from "@/lib/markdown/questions";

import { askMetadata } from "./metadata";
import { ASK_PAGE_SIZE, askPageCount, parseAskPage } from "./pagination";

/** Ask list pages 2..N, for `generateStaticParams`. */
export async function askListStaticParams(): Promise<{ page: string }[]> {
  const { total } = await getQuestions({ page: 1, pageSize: ASK_PAGE_SIZE });
  return Array.from({ length: askPageCount(total) - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

/** The page number if it exists, checked against the (cached) first-page total before any other fetch. */
export async function resolveAskPage(
  segment: string
): Promise<{ page: number; pageCount: number } | null> {
  const page = parseAskPage(segment);
  if (page === null) return null;
  const { total } = await getQuestions({ page: 1, pageSize: ASK_PAGE_SIZE });
  const pageCount = askPageCount(total);
  return page <= pageCount ? { page, pageCount } : null;
}

export async function askListMetadata(segment: string): Promise<Metadata> {
  const resolved = await resolveAskPage(segment);
  if (!resolved) return {};
  return askMetadata({
    title: `Ask · Page ${resolved.page}`,
    description: `Earlier conversations, page ${resolved.page} of ${resolved.pageCount}.`,
    path: `/ask/page/${resolved.page}`,
  });
}

/** Every published conversation with a valid slug, for `generateStaticParams`. */
export async function questionStaticParams(): Promise<{ slug: string }[]> {
  const questions = await getAllPublishedQuestions();
  return questions
    .filter((question) => isSlug(question.slug))
    .map(({ slug }) => ({ slug }));
}

export async function questionMetadata(slug: string): Promise<Metadata> {
  const question = await findPublishedQuestion(slug);
  if (!question) return {};
  const ownerReply = question.replies.find((reply) => reply.by === "owner");
  return askMetadata({
    title: excerpt(question.body, 60),
    description: excerpt(ownerReply?.body ?? question.body, 160),
    path: `/ask/${question.slug}`,
    type: "article",
    siteImage: false,
  });
}
