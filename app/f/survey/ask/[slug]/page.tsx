import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visitorName } from "@/flavors/survey/components/ask/chat-bubble";
import { ChatThread } from "@/flavors/survey/components/ask/chat-thread";
import { entryLabel } from "@/flavors/survey/components/ask/entry-number";
import { Page } from "@/flavors/survey/components/site/page";
import { Container } from "@/flavors/survey/components/ui/container";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";

import { site } from "@/content/site";
import { questionMetadata, questionStaticParams } from "@/lib/ask/pages/load";
import { formatTimestamp } from "@/lib/format";
import {
  findPublishedQuestion,
  getAllPublishedQuestions,
} from "@/lib/markdown/questions";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

/**
 * Every published entry is prerendered; one published after the build
 * renders on its first request and is then cached as a static page.
 */
export const dynamicParams = true;

export const generateStaticParams = questionStaticParams;

export async function generateMetadata({
  params,
}: PageProps<"/f/survey/ask/[slug]">): Promise<Metadata> {
  return questionMetadata((await params).slug);
}

const repliesLabel = (count: number) =>
  count === 0 ? "No replies yet" : count === 1 ? "1 reply" : `${count} replies`;

export default async function QuestionPage({
  params,
}: PageProps<"/f/survey/ask/[slug]">) {
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  const questions = await getAllPublishedQuestions();
  const index = questions.findIndex((entry) => entry.slug === question.slug);
  const label = entryLabel(questions.length - (index === -1 ? 0 : index));

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          kicker={label}
          title={
            question.by === "owner"
              ? `A note from ${site.handle}`
              : `A conversation with ${visitorName(question.authorName)}`
          }
          meta={[
            {
              label: "Written",
              value: (
                <time dateTime={question.submittedAt}>
                  {formatTimestamp(question.submittedAt)}
                </time>
              ),
            },
            { label: "Replies", value: repliesLabel(question.replies.length) },
          ]}
          scene={null}
        />
        <Container className="mt-12 max-w-[64rem]">
          <ChatThread thread={question} label={label} standalone />
          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-rule-strong pt-6">
            <Link
              href="/ask"
              className="inline-flex min-h-11 items-center gap-2 font-medium underline decoration-contour underline-offset-[0.35em]"
            >
              <span aria-hidden>←</span> The whole notebook
            </Link>
            <Link
              href="/ask#start"
              className="inline-flex min-h-11 items-center font-medium underline decoration-contour underline-offset-[0.35em]"
            >
              Ask something else
            </Link>
          </footer>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
