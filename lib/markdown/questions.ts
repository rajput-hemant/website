import * as React from "react";

import { getQuestions } from "@/lib/data";
import type { Question } from "@/lib/data/types";

import { isAskSlug } from "./slugs";

const PAGE_SIZE = 100;

/**
 * Every published /ask entry, newest first, across as many pages as it takes.
 * The pages are fixed-size `question`-tagged fetches, so every caller shares
 * the same cached reads until publishing revalidates the tag.
 */
export const getAllPublishedQuestions = React.cache(
  async (): Promise<Question[]> => {
    const first = await getQuestions({ page: 1, pageSize: PAGE_SIZE });
    const pageCount = Math.ceil(first.total / PAGE_SIZE);
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
        getQuestions({ page: index + 2, pageSize: PAGE_SIZE })
      )
    );
    return [first, ...rest].flatMap((page) => page.items);
  }
);

/**
 * A published entry by slug, looked up in the cached list. Unknown slugs
 * (however well-formed) cost no Sanity request of their own.
 */
export async function findPublishedQuestion(
  slug: string
): Promise<Question | null> {
  if (!isAskSlug(slug)) return null;
  const questions = await getAllPublishedQuestions();
  return questions.find((question) => question.slug === slug) ?? null;
}

const EXCERPT_LENGTH = 80;

/** The question's first line, cut at a word boundary: a title for lists and headings. */
export function questionExcerpt(question: Question): string {
  const firstLine = question.body.trim().split("\n")[0]?.trim() ?? "";
  if (firstLine.length <= EXCERPT_LENGTH) return firstLine;
  const cut = firstLine.slice(0, EXCERPT_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > EXCERPT_LENGTH / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:!?-]+$/, "")}…`;
}

export function questionDate(question: Question): string {
  return question.publishedAt ?? question.submittedAt;
}
