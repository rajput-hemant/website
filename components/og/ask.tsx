import { site } from "@/content/site";
import { formatTimestamp } from "@/lib/format";
import {
  findPublishedQuestion,
  getAllPublishedQuestions,
  questionDate,
} from "@/lib/markdown/questions";

import { QuestionCard } from "./og-card";
import { ogDisplayUrl, renderOgImage, renderPageOgImage } from "./render";

export const askQuestionImageAlt = `A conversation on ${site.name}'s ask page`;
export const askImageAlt = `Ask ${site.name} anything`;

/** The ask page's social card. */
export const renderAskImage = () => renderPageOgImage("/ask");

const NAME_MAX_LENGTH = 24;

/** Names can run to 60 characters; the footer shares its line with the URL. */
function shortName(name = "Anonymous"): string {
  return name.length <= NAME_MAX_LENGTH
    ? name
    : `${name.slice(0, NAME_MAX_LENGTH - 1).trimEnd()}…`;
}

function replyCount(count: number): string {
  if (count === 0) return "";
  return `${count} ${count === 1 ? "reply" : "replies"}`;
}

/** Every published question gets a card. */
export async function askQuestionImageParams() {
  const questions = await getAllPublishedQuestions();
  return questions.map((question) => ({ slug: question.slug }));
}

/** The social card for one ask conversation, or the ask page's card if it's gone. */
export async function renderAskQuestionImage(slug: string) {
  const question = await findPublishedQuestion(slug);
  if (!question) return renderPageOgImage("/ask");

  return renderOgImage(
    <QuestionCard
      siteName={site.name}
      question={question.body}
      meta={[
        `Started by ${question.by === "owner" ? site.name : shortName(question.authorName)}`,
        formatTimestamp(questionDate(question)),
        replyCount(question.replies.length),
      ]
        .filter(Boolean)
        .join(" · ")}
      url={ogDisplayUrl(`/ask/${question.slug}`)}
    />
  );
}
