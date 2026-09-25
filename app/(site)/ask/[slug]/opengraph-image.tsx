import { site } from "@/content/site";
import { getQuestion } from "@/lib/data";
import { formatDay } from "@/lib/markdown/document";
import {
  getAllPublishedQuestions,
  questionDate,
} from "@/lib/markdown/questions";
import { isAskSlug } from "@/lib/markdown/slugs";
import { QuestionCard } from "@/components/og/og-card";
import {
  ogDisplayUrl,
  renderOgImage,
  renderPageOgImage,
} from "@/components/og/render";
import { ogSize } from "@/components/og/theme";

export const alt = `A question for ${site.name}`;
export const size = ogSize;
export const contentType = "image/png";

const NAME_MAX_LENGTH = 24;

/** Names can run to 60 characters; the footer shares its line with the URL. */
function shortName(name = "Anonymous"): string {
  return name.length <= NAME_MAX_LENGTH
    ? name
    : `${name.slice(0, NAME_MAX_LENGTH - 1).trimEnd()}…`;
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
  const question = isAskSlug(slug) ? await getQuestion(slug) : null;
  if (!question) return renderPageOgImage("/ask");

  return renderOgImage(
    <QuestionCard
      siteName={site.name}
      question={question.body}
      meta={`Asked by ${shortName(question.authorName)} · ${formatDay(questionDate(question))}`}
      url={ogDisplayUrl(`/ask/${question.slug}`)}
    />
  );
}
