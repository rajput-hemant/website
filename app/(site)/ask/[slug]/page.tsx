import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { site } from "@/content/site";
import { formatTimestamp } from "@/lib/format";
import {
  findPublishedQuestion,
  getAllPublishedQuestions,
} from "@/lib/markdown/questions";
import { visitorName } from "@/components/ask/chat-bubble";
import { ChatThread } from "@/components/ask/chat-thread";
import { excerpt } from "@/components/ask/format";
import { OwnerProvider } from "@/components/ask/owner-provider";
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
  const ownerReply = question.replies.find((reply) => reply.by === "owner");
  return askMetadata({
    title: excerpt(question.body, 60),
    description: excerpt(ownerReply?.body ?? question.body, 160),
    path: `/ask/${question.slug}`,
    type: "article",
    siteImage: false,
  });
}

const repliesLabel = (count: number) =>
  count === 0 ? "No replies yet" : count === 1 ? "1 reply" : `${count} replies`;

export default async function QuestionPage({ params }: QuestionPageProps) {
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  return (
    <OwnerProvider>
      <Container className="pt-16 sm:pt-24">
        <BackLink href="/ask">Ask</BackLink>

        <header className="mt-10 mb-8">
          <h1 className="display text-3xl font-book text-foreground sm:text-4xl sm:font-light">
            {question.by === "owner"
              ? `A note from ${site.name}`
              : `A conversation with ${visitorName(question.authorName)}`}
          </h1>
          <p className="mt-4 meta text-subtle">
            Started{" "}
            <time dateTime={question.submittedAt}>
              {formatTimestamp(question.submittedAt)}
            </time>{" "}
            · {repliesLabel(question.replies.length)}
          </p>
        </header>

        <ChatThread thread={question} standalone />

        <footer className="mt-16 border-t border-border pt-8">
          <p className="text-muted">
            Something else on your mind?{" "}
            <Link href="/ask" className="link text-foreground">
              Start a conversation
            </Link>
            .
          </p>
        </footer>
      </Container>
    </OwnerProvider>
  );
}
