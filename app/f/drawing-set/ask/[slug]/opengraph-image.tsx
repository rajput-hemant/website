import { site } from "@/content/site";
import { formatTimestamp } from "@/lib/format";
import {
  findPublishedQuestion,
  getAllPublishedQuestions,
  questionDate,
} from "@/lib/markdown/questions";
import { QuestionCard } from "@/components/og/og-card";
import {
  ogDisplayUrl,
  renderOgImage,
  renderPageOgImage,
} from "@/components/og/render";
import { ogSize } from "@/components/og/theme";

export const alt = `A conversation on ${site.name}'s ask page`;
export const size = ogSize;
export const contentType = "image/png";

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

export async function generateStaticParams() {
  const questions = await getAllPublishedQuestions();
  return questions.map((question) => ({ slug: question.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
