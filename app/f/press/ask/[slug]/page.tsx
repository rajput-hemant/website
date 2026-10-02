import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { queryLabel, visitorName } from "@/flavors/press/components/ask/labels";
import { Thread } from "@/flavors/press/components/ask/thread";
import {
  CorrectionPoster,
  LoupePoster,
} from "@/flavors/press/components/scene/view-posters";
import { ViewSlot } from "@/flavors/press/components/scene/view-slot";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { VIEW, viewData } from "@/flavors/press/lib/scene/views";

import { questionMetadata, questionStaticParams } from "@/lib/ask/pages/load";
import { getSiteIdentity } from "@/lib/data";
import { formatTimestamp } from "@/lib/format";
import {
  findPublishedQuestion,
  getAllPublishedQuestions,
} from "@/lib/markdown/questions";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

/**
 * Every published thread is prerendered; one published after the build
 * renders on its first request and is cached (see lib/ask/pages/load).
 */
export const dynamicParams = true;

export const generateStaticParams = questionStaticParams;

export async function generateMetadata({
  params,
}: PageProps<"/f/press/ask/[slug]">): Promise<Metadata> {
  return questionMetadata((await params).slug);
}

const repliesLabel = (count: number) =>
  count === 0 ? "No replies yet" : count === 1 ? "1 reply" : `${count} replies`;

export default async function QuestionPage({
  params,
}: PageProps<"/f/press/ask/[slug]">) {
  const site = await getSiteIdentity();
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  const questions = await getAllPublishedQuestions();
  const index = questions.findIndex((entry) => entry.slug === question.slug);
  const label = queryLabel(questions.length - (index === -1 ? 0 : index));
  const answered = question.replies.some((reply) => reply.by === "owner");

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          sheet={7}
          kicker={label}
          title={
            question.by === "owner"
              ? `A note from ${site.handle}`
              : `A query from ${visitorName(question.authorName)}`
          }
          meta={[
            {
              label: "Marked",
              value: (
                <time dateTime={question.submittedAt}>
                  {formatTimestamp(question.submittedAt)}
                </time>
              ),
            },
            { label: "Replies", value: repliesLabel(question.replies.length) },
          ]}
          scene="thread"
        >
          {/* One sheet with the query marked on it; struck in blue once answered. */}
          <ViewSlot
            id={VIEW.correction}
            data={viewData<typeof VIEW.correction>({ answered })}
            className="mt-8 h-24 w-28"
            poster={<CorrectionPoster answered={answered} />}
          />
        </PageHeader>
        <Container className="mt-12 max-w-[64rem]">
          <div className="relative">
            {/* The loupe in the margin follows the pointer down the thread. */}
            <ViewSlot
              id={VIEW.threadLoupe}
              className="absolute inset-y-0 -left-3 w-10"
              poster={<LoupePoster at="12%" />}
            />
            <Thread thread={question} label={label} standalone />
          </div>
          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-5">
            <Link
              href="/ask"
              className="inline-flex min-h-11 items-center font-bold underline decoration-pink decoration-2 underline-offset-[0.3em]"
            >
              ← The whole sheet
            </Link>
            <Link
              href="/ask#start"
              className="inline-flex min-h-11 items-center font-bold underline decoration-rule decoration-2 underline-offset-[0.3em]"
            >
              Send another query
            </Link>
          </footer>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
