import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visitorName } from "@/flavors/surface/components/ask/chat-bubble";
import { ChatThread } from "@/flavors/surface/components/ask/chat-thread";
import { queueLabel } from "@/flavors/surface/components/ask/queue-number";
import { Panel } from "@/flavors/surface/components/site/panel";

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
}: PageProps<"/f/surface/ask/[slug]">): Promise<Metadata> {
  return questionMetadata((await params).slug);
}

const repliesLabel = (count: number) =>
  count === 0 ? "No replies yet" : count === 1 ? "1 reply" : `${count} replies`;

export default async function QuestionPage({
  params,
}: PageProps<"/f/surface/ask/[slug]">) {
  const question = await findPublishedQuestion((await params).slug);
  if (!question) notFound();

  const questions = await getAllPublishedQuestions();
  const index = questions.findIndex((entry) => entry.slug === question.slug);
  const queue = queueLabel(questions.length - (index === -1 ? 0 : index));

  return (
    <OwnerProvider>
      <Panel
        ch="06"
        name="Ask"
        aside={queue}
        title={
          <span className="block text-h2">
            {question.by === "owner"
              ? `A note from ${site.handle}`
              : `A conversation with ${visitorName(question.authorName)}`}
          </span>
        }
        meta={
          <dl className="flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="legend">Started</dt>
              <dd className="mt-1 font-medium">
                <time dateTime={question.submittedAt}>
                  {formatTimestamp(question.submittedAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="legend">Replies</dt>
              <dd className="mt-1 font-medium">
                {repliesLabel(question.replies.length)}
              </dd>
            </div>
          </dl>
        }
      >
        <Link href="/ask" className="key key-sm mb-10">
          <span aria-hidden>&larr;</span> All conversations
        </Link>

        <ChatThread thread={question} queue={queue} standalone />

        <footer className="seam-t mt-16 pt-8">
          <p className="text-ink-2">
            Something else on your mind?{" "}
            <Link href="/ask" className="text-ink underline underline-offset-2">
              Ask a question
            </Link>
            .
          </p>
        </footer>
      </Panel>
    </OwnerProvider>
  );
}
