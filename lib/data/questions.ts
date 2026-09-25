import type { QUESTIONS_QUERY_RESULT } from "@/sanity.types";

import { optional, toRichText } from "./shared";
import type { Question } from "./types";

type QuestionResult = QUESTIONS_QUERY_RESULT["items"][number];

export function mapQuestion(result: QuestionResult): Question {
  const answer = toRichText(result.answer);
  return {
    id: result._id,
    slug: result.slug ?? "",
    body: result.body ?? "",
    authorName: optional(result.authorName),
    status: result.status ?? "published",
    answer: answer.length > 0 ? answer : undefined,
    replies: (result.replies ?? []).flatMap(({ by, body, createdAt }) =>
      by && body && createdAt ? [{ by, body, createdAt }] : []
    ),
    submittedAt: result.submittedAt ?? "",
    publishedAt: optional(result.publishedAt),
  };
}
