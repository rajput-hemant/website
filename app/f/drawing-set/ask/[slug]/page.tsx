import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visitorName } from "@/flavors/drawing-set/components/ask/chat-bubble";
import { ChatThread } from "@/flavors/drawing-set/components/ask/chat-thread";
import { rfiLabel } from "@/flavors/drawing-set/components/ask/rfi-number";
import { Page } from "@/flavors/drawing-set/components/site";
import { Container, MetaList } from "@/flavors/drawing-set/components/ui";
import { ArrowLeft } from "lucide-react";

import { site } from "@/content/site";
import { questionMetadata, questionStaticParams } from "@/lib/ask/pages/load";
import { formatTimestamp } from "@/lib/format";
import {
  findPublishedQuestion,
  getAllPublishedQuestions,
} from "@/lib/markdown/questions";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

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

export function generateStaticParams() {
  return questionStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/f/drawing-set/ask/[slug]">): Promise<Metadata> {
  return questionMetadata((await params).slug);
}

const repliesLabel = (count: number) =>
  count === 0 ? "No replies yet" : count === 1 ? "1 reply" : `${count} replies`;

export default async function QuestionPage({
  params,
}: PageProps<"/f/drawing-set/ask/[slug]">) {
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  const questions = await getAllPublishedQuestions();
  const index = questions.findIndex((entry) => entry.slug === question.slug);
  const label = rfiLabel(questions.length - (index === -1 ? 0 : index));

  return (
    <Page>
      <OwnerProvider>
        <Container className="pt-16 sm:pt-24">
          <Link
            href="/ask"
            className="inline-flex min-h-11 items-center gap-1.5 font-mono text-mono-xs tracking-[0.1em] text-ink-soft uppercase transition-colors hover:text-ink"
          >
            <ArrowLeft aria-hidden strokeWidth={1.75} className="size-3.5" />
            Ask
          </Link>

          <header className="mt-8 mb-10">
            <p className="font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase">
              Sheet 06 &nbsp;&middot;&nbsp; RFI log &nbsp;&middot;&nbsp; {label}
            </p>
            <h1 className="mt-4 font-display text-h2 leading-[0.9] font-[540] tracking-[-0.005em] text-ink uppercase [font-stretch:62%] sm:text-[3.5rem]">
              {question.by === "owner"
                ? `A note from ${site.handle}`
                : `A conversation with ${visitorName(question.authorName)}`}
            </h1>
            <MetaList
              items={[
                {
                  label: "Filed",
                  value: (
                    <time dateTime={question.submittedAt}>
                      {formatTimestamp(question.submittedAt)}
                    </time>
                  ),
                },
                {
                  label: "Replies",
                  value: repliesLabel(question.replies.length),
                },
              ]}
              className="mt-6 max-w-sm"
            />
          </header>

          <ChatThread thread={question} rfiLabel={label} standalone />

          <footer className="mt-16 border-t border-line pt-8">
            <p className="text-ink-soft">
              Something else on your mind?{" "}
              <Link
                href="/ask"
                className="text-ink underline underline-offset-2"
              >
                Submit an RFI
              </Link>
              .
            </p>
          </footer>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
