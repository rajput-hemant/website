import { getQuestions } from "@/lib/data";
import type { Question } from "@/lib/data/types";

const PAGE_SIZE = 100;

/** Every published /ask entry, newest first, across as many pages as it takes. */
export async function getAllPublishedQuestions(): Promise<Question[]> {
  const first = await getQuestions({ page: 1, pageSize: PAGE_SIZE });
  const pageCount = Math.ceil(first.total / PAGE_SIZE);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      getQuestions({ page: index + 2, pageSize: PAGE_SIZE })
    )
  );
  return [first, ...rest].flatMap((page) => page.items);
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
