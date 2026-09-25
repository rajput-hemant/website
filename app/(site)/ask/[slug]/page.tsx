import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toPlainText } from "@portabletext/toolkit";

import { getQuestion } from "@/lib/data";
import { getAllPublishedQuestions } from "@/lib/markdown/questions";
import { isAskSlug } from "@/lib/markdown/slugs";
import { excerpt, formatAskDate } from "@/components/ask/format";
import { MessageBody } from "@/components/ask/message-body";
import { OwnerAnswer } from "@/components/ask/owner-answer";
import { QuestionReplies } from "@/components/ask/question-replies";
import { RichText } from "@/components/portable-text";
import { Container } from "@/components/site/container";

import { askFeedAlternates } from "../_lib/metadata";

type QuestionPageProps = { params: Promise<{ slug: string }> };

/**
 * Every published entry is prerendered. `dynamicParams` stays `true` because
 * `generateStaticParams` only runs at build time: with `false`, an entry
 * published afterwards would 404 until the next build. With `true`, its first
 * request renders it through the `question`-tagged fetch and caches the result
 * as a static page. Unknown and unpublished slugs render `notFound()` under the
 * same tag, so publishing (which revalidates `question`) replaces that 404.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const questions = await getAllPublishedQuestions();
  return questions.map(({ slug }) => ({ slug }));
}

/** Malformed slugs never reach Sanity. */
async function findQuestion(slug: string) {
  return isAskSlug(slug) ? getQuestion(slug) : null;
}

export async function generateMetadata({
  params,
}: QuestionPageProps): Promise<Metadata> {
  const question = await findQuestion((await params).slug);
  if (!question) return {};
  const title = excerpt(question.body, 60);
  const description = excerpt(
    question.answer ? toPlainText(question.answer) : question.body,
    160
  );
  const url = `/ask/${question.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url, types: askFeedAlternates },
    openGraph: { type: "article", title, description, url },
  };
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const question = await findQuestion((await params).slug);
  if (!question) notFound();

  const authorName = question.authorName ?? "Anonymous";
  const long = question.body.length > 140;

  return (
    <Container className="pt-16 pb-section sm:pt-24">
      <Link href="/ask" className="link meta text-subtle hover:text-foreground">
        <span aria-hidden>← </span>Ask
      </Link>

      <article className="mt-10">
        <header>
          <p className="meta text-subtle">
            <span className="text-muted">{authorName}</span>
            <span aria-hidden> · </span>
            <time dateTime={question.submittedAt}>
              {formatAskDate(question.submittedAt)}
            </time>
          </p>
          <h1 className="mt-5">
            <MessageBody
              as="span"
              className={
                long
                  ? "block font-serif text-xl leading-relaxed text-foreground"
                  : "block display text-2xl text-foreground sm:text-4xl"
              }
            >
              {question.body}
            </MessageBody>
          </h1>
        </header>

        {question.answer && (
          <OwnerAnswer
            className="mt-12"
            label={
              question.publishedAt ? (
                <>
                  answered ·{" "}
                  <time dateTime={question.publishedAt}>
                    {formatAskDate(question.publishedAt)}
                  </time>
                </>
              ) : undefined
            }
          >
            <RichText value={question.answer} />
          </OwnerAnswer>
        )}

        <QuestionReplies
          replies={question.replies}
          visitorName={authorName}
          className="mt-12"
        />
      </article>

      <footer className="mt-16 border-t border-border pt-8">
        <p className="text-muted">
          Have a question of your own?{" "}
          <Link href="/ask" className="link text-foreground">
            Ask me anything
          </Link>
          .
        </p>
      </footer>
    </Container>
  );
}
