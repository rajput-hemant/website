import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toPlainText } from "@portabletext/toolkit";

import { formatTimestamp } from "@/lib/format";
import {
  findPublishedQuestion,
  getAllPublishedQuestions,
} from "@/lib/markdown/questions";
import { excerpt } from "@/components/ask/format";
import { MessageBody } from "@/components/ask/message-body";
import { OwnerAnswer } from "@/components/ask/owner-answer";
import { QuestionReplies } from "@/components/ask/question-replies";
import { RichText } from "@/components/portable-text";
import { Container } from "@/components/site/container";
import { BackLink } from "@/components/ui/back-link";

import { askMetadata } from "../_lib/metadata";

type QuestionPageProps = { params: Promise<{ slug: string }> };

/**
 * Every published entry is prerendered. `dynamicParams` stays `true` because
 * `generateStaticParams` only runs at build time: with `false`, an entry
 * published afterwards would 404 until the next build. With `true`, its first
 * request renders it and caches the result as a static page. Slugs are
 * checked against the cached list of published entries (`question` tag), so an
 * unknown slug costs no Sanity request; publishing revalidates the tag and
 * replaces its 404.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const questions = await getAllPublishedQuestions();
  return questions.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: QuestionPageProps): Promise<Metadata> {
  const question = await findPublishedQuestion((await params).slug);
  if (!question) return {};
  const title = excerpt(question.body, 60);
  const description = excerpt(
    question.answer ? toPlainText(question.answer) : question.body,
    160
  );
  return askMetadata({
    title,
    description,
    path: `/ask/${question.slug}`,
    type: "article",
    siteImage: false,
  });
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  const authorName = question.authorName ?? "Anonymous";
  const long = question.body.length > 140;

  return (
    <Container className="pt-16 sm:pt-24">
      <BackLink href="/ask">Ask</BackLink>

      <article className="mt-10">
        <header>
          <p className="meta text-subtle">
            <span className="text-muted">{authorName}</span>
            <span aria-hidden> · </span>
            <time dateTime={question.submittedAt}>
              {formatTimestamp(question.submittedAt)}
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
                    {formatTimestamp(question.publishedAt)}
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
