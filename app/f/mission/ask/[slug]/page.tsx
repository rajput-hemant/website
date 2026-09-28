import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  sampleLabel,
  visitorName,
} from "@/flavors/mission/components/ask/labels";
import { Thread } from "@/flavors/mission/components/ask/thread";
import { Page } from "@/flavors/mission/components/site/page";
import { Container } from "@/flavors/mission/components/ui/container";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";

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
}: PageProps<"/f/mission/ask/[slug]">): Promise<Metadata> {
  return questionMetadata((await params).slug);
}

const repliesLabel = (count: number) =>
  count === 0 ? "No replies yet" : count === 1 ? "1 reply" : `${count} replies`;

export default async function QuestionPage({
  params,
}: PageProps<"/f/mission/ask/[slug]">) {
  const site = await getSiteIdentity();
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  const questions = await getAllPublishedQuestions();
  const index = questions.findIndex((entry) => entry.slug === question.slug);
  const label = sampleLabel(questions.length - (index === -1 ? 0 : index));

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          section={7}
          kicker={label}
          title={
            question.by === "owner"
              ? `A note from ${site.handle}`
              : `A question from ${visitorName(question.authorName)}`
          }
          meta={[
            {
              label: "Received",
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
          <Thread thread={question} label={label} standalone />
          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-rule-strong pt-5">
            <Link
              href="/ask"
              className="rule-link inline-flex min-h-11 items-center font-medium"
            >
              ← The whole loop
            </Link>
            <Link
              href="/ask#start"
              className="rule-link inline-flex min-h-11 items-center text-ink-soft"
            >
              Open another channel
            </Link>
          </footer>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
