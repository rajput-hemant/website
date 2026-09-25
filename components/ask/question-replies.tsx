import { useId } from "react";

import { type Question } from "@/lib/data/types";

import { formatAskDate } from "./format";
import { MessageBody } from "./message-body";
import { OwnerAnswer } from "./owner-answer";

/** Follow-ups after the answer, in order: the owner's with the accent rule, the visitor's neutral. */
export function QuestionReplies({
  replies,
  visitorName,
  className,
}: {
  replies: Question["replies"];
  visitorName: string;
  className?: string;
}) {
  const headingId = useId();
  if (replies.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2 id={headingId} className="meta text-subtle">
        Follow-ups
      </h2>
      <ol className="mt-6 grid gap-8">
        {replies.map((reply, index) => {
          const date = (
            <time dateTime={reply.createdAt}>
              {formatAskDate(reply.createdAt)}
            </time>
          );
          return (
            <li key={`${reply.createdAt}-${index}`}>
              {reply.by === "owner" ? (
                <OwnerAnswer label={<>replied · {date}</>}>
                  <MessageBody>{reply.body}</MessageBody>
                </OwnerAnswer>
              ) : (
                <div className="border-l-2 border-border pl-4 sm:pl-5">
                  <p className="meta text-subtle">
                    <span className="text-muted">{visitorName}</span>
                    <span aria-hidden> · </span>
                    {date}
                  </p>
                  <MessageBody className="mt-2.5 font-serif text-lg">
                    {reply.body}
                  </MessageBody>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
