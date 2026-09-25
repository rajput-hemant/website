import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { type Question } from "@/lib/data/types";
import { RichText } from "@/components/portable-text";

import { askEntryHref, excerpt, formatAskDate } from "./format";
import { MessageBody } from "./message-body";
import { OwnerAnswer } from "./owner-answer";

const repliesLabel = (count: number) =>
  count === 1 ? "1 reply" : `${count} replies`;

/** One published message in the /ask list, linking to its permalink. */
export function QuestionEntry({ question }: { question: Question }) {
  const href = askEntryHref(question.slug);
  const replies = question.replies.length;

  return (
    <article className="grid gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="meta text-subtle">
          <span className="text-muted">
            {question.authorName ?? "Anonymous"}
          </span>
          <span aria-hidden> · </span>
          <time dateTime={question.submittedAt}>
            {formatAskDate(question.submittedAt)}
          </time>
        </p>
        <Link
          href={href}
          className="group/thread inline-flex items-center gap-1.5 meta text-muted transition-colors hover:text-foreground"
        >
          {replies > 0 ? `Thread · ${repliesLabel(replies)}` : "Thread"}
          <span className="sr-only">: {excerpt(question.body)}</span>
          <ArrowRight
            aria-hidden
            strokeWidth={1.75}
            className="size-3 transition-transform duration-200 ease-snappy group-hover/thread:translate-x-0.5"
          />
        </Link>
      </div>

      <MessageBody className="font-serif text-lg text-foreground">
        {question.body}
      </MessageBody>

      {question.answer && (
        <OwnerAnswer>
          <RichText value={question.answer} />
        </OwnerAnswer>
      )}
    </article>
  );
}
