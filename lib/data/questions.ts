import type { QUESTIONS_QUERY_RESULT } from "@/sanity.types";

import { LEGACY_ANSWER_KEY, legacyAnswerReply } from "@/lib/ask/legacy-answer";

import { optional } from "./shared";
import type { ChatReply, Question } from "./types";

type QuestionResult = QUESTIONS_QUERY_RESULT["items"][number];

/** The latest valid timestamp, or "" when there is none. */
function latest(times: string[]): string {
  let best = "";
  for (const time of times) {
    if (Number.isNaN(Date.parse(time))) continue;
    if (best === "" || Date.parse(time) > Date.parse(best)) best = time;
  }
  return best;
}

/**
 * The public replies of a thread, oldest first. A legacy `answer` that the
 * doctor has not migrated yet is folded in as a published owner reply, under
 * the same key the migration uses so it never appears twice.
 */
function mapReplies(result: QuestionResult): ChatReply[] {
  const replies = (result.replies ?? []).flatMap(
    ({ _key, by, authorName, body, createdAt }): ChatReply[] =>
      by && body && createdAt
        ? [
            {
              key: _key,
              by,
              authorName: optional(authorName),
              body,
              createdAt,
              status: "published",
            },
          ]
        : []
  );

  if (!replies.some((reply) => reply.key === LEGACY_ANSWER_KEY)) {
    const legacy = legacyAnswerReply(result, "");
    if (legacy) {
      replies.push({
        key: legacy._key,
        by: legacy.by,
        body: legacy.body,
        createdAt: legacy.createdAt,
        status: "published",
      });
    }
  }

  return replies.sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );
}

export function mapQuestion(result: QuestionResult): Question {
  const replies = mapReplies(result);
  const submittedAt = result.submittedAt ?? "";
  const publishedAt = optional(result.publishedAt);
  const threadActivity = result.lastActivityAt ?? publishedAt ?? submittedAt;

  return {
    id: result._id,
    slug: result.slug ?? "",
    by: result.by,
    body: result.body ?? "",
    authorName: optional(result.authorName),
    status: result.status,
    replies,
    submittedAt,
    publishedAt,
    lastActivityAt: latest([
      threadActivity,
      ...replies.map((reply) => reply.createdAt),
    ]),
  };
}
