import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visitorName } from "@/flavors/timetable/components/ask/chat-bubble";
import { ChatThread } from "@/flavors/timetable/components/ask/chat-thread";
import { noticeLabel } from "@/flavors/timetable/components/ask/notice-number";
import { Page } from "@/flavors/timetable/components/site";
import { Container, PageHeader } from "@/flavors/timetable/components/ui";

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

export const generateStaticParams = questionStaticParams;

export async function generateMetadata({
  params,
}: PageProps<"/f/timetable/ask/[slug]">): Promise<Metadata> {
  return questionMetadata((await params).slug);
}

const repliesLabel = (count: number) =>
  count === 0 ? "No replies yet" : count === 1 ? "1 reply" : `${count} replies`;

export default async function QuestionPage({
  params,
}: PageProps<"/f/timetable/ask/[slug]">) {
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  const questions = await getAllPublishedQuestions();
  const index = questions.findIndex((entry) => entry.slug === question.slug);
  const label = noticeLabel(questions.length - (index === -1 ? 0 : index));

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          platform="6"
          kicker={label}
          title={
            question.by === "owner"
              ? `A note from ${site.handle}`
              : `A conversation with ${visitorName(question.authorName)}`
          }
          meta={[
            {
              label: "Posted",
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
          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-rule-strong pt-6">
            <Link
              href="/ask"
              className="inline-flex min-h-11 items-center gap-2 border-b-2 border-current leading-none font-bold"
            >
              <span aria-hidden>←</span> All notices
            </Link>
            <Link
              href="/ask#start"
              className="inline-flex min-h-11 items-center gap-2 leading-none font-bold underline decoration-rule-strong decoration-2 underline-offset-[0.3em]"
            >
              Ask something else
            </Link>
          </footer>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
