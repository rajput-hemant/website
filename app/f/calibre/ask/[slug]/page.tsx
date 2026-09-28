import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  requestLabel,
  visitorName,
} from "@/flavors/calibre/components/ask/labels";
import { Thread } from "@/flavors/calibre/components/ask/thread";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { actionLinkClass } from "@/flavors/calibre/components/ui/link-class";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";

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
}: PageProps<"/f/calibre/ask/[slug]">): Promise<Metadata> {
  return questionMetadata((await params).slug);
}

const repliesLabel = (count: number) =>
  count === 0 ? "No replies yet" : count === 1 ? "1 reply" : `${count} replies`;

export default async function QuestionPage({
  params,
}: PageProps<"/f/calibre/ask/[slug]">) {
  const site = await getSiteIdentity();
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  const questions = await getAllPublishedQuestions();
  const index = questions.findIndex((entry) => entry.slug === question.slug);
  const label = requestLabel(questions.length - (index === -1 ? 0 : index));

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          hour={null}
          kicker={label}
          title={
            question.by === "owner"
              ? `A note from ${site.handle}`
              : `A question from ${visitorName(question.authorName)}`
          }
          meta={[
            {
              label: "Asked",
              value: (
                <time dateTime={question.submittedAt}>
                  {formatTimestamp(question.submittedAt)}
                </time>
              ),
            },
            { label: "Replies", value: repliesLabel(question.replies.length) },
          ]}
        />
        <Container className="mt-12 max-w-[64rem]">
          <div className="engraving rounded-[3px] px-4 py-6 sm:px-7 sm:py-8">
            <Thread thread={question} label={label} standalone />
          </div>
          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line-strong pt-5">
            <Link href="/ask" className={actionLinkClass}>
              ← Every engraving
            </Link>
            <Link href="/ask#start" className={actionLinkClass}>
              Ask another question
            </Link>
          </footer>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
