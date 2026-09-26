import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { site } from "@/content/site";
import { excerpt } from "@/lib/ask/format";
import { formatTimestamp } from "@/lib/format";
import {
  findPublishedQuestion,
  getAllPublishedQuestions,
} from "@/lib/markdown/questions";
import { visitorName } from "@/components/ask/chat-bubble";
import { ChatThread } from "@/components/ask/chat-thread";
import { OwnerProvider } from "@/components/ask/owner-provider";
import { Page } from "@/components/site";
import { Container } from "@/components/ui";

import { askMetadata } from "../_lib/metadata";

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
}: PageProps<"/ask/[slug]">): Promise<Metadata> {
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

export default async function QuestionPage({
  params,
}: PageProps<"/ask/[slug]">) {
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  return (
    <Page>
      <OwnerProvider>
        <Container className="pt-16 sm:pt-24">
          <Link
            href="/ask"
            className="inline-flex min-h-11 items-center gap-1.5 font-mono text-mono-xs tracking-[0.1em] text-graphite uppercase transition-colors hover:text-paper"
          >
            <ArrowLeft aria-hidden strokeWidth={1.75} className="size-3.5" />
            Ask
          </Link>

          <header className="mt-8 mb-8">
            <h1 className="font-display text-3xl font-normal text-paper sm:text-4xl">
              {question.by === "owner"
                ? `A note from ${site.name}`
                : `A conversation with ${visitorName(question.authorName)}`}
            </h1>
            <p className="mt-4 font-mono text-mono-xs text-pencil">
              Started{" "}
              <time dateTime={question.submittedAt}>
                {formatTimestamp(question.submittedAt)}
              </time>{" "}
              &middot; {repliesLabel(question.replies.length)}
            </p>
          </header>

          <ChatThread thread={question} standalone />

          <footer className="mt-16 border-t border-hairline pt-8">
            <p className="text-graphite">
              Something else on your mind?{" "}
              <Link
                href="/ask"
                className="text-paper underline underline-offset-2"
              >
                Start a conversation
              </Link>
              .
            </p>
          </footer>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
