import * as React from "react";
import { cn } from "@/flavors/maquette/lib/utils";

import type { Question } from "@/lib/data/types";

/** Whether the author has answered on the card. */
export const isAnswered = (thread: Pick<Question, "replies">) =>
  thread.replies.some((reply) => reply.by === "owner");

/**
 * A comment card pinned to the model, cut from the model's own materials:
 * white card once it is answered, a basswood frame while it waits, as a
 * piece still going up. The pin head turns basswood while the card is
 * pointed at or focused, as the model's pins do.
 */
export function CommentCard({
  as: Tag = "div",
  answered,
  className,
  children,
  ...rest
}: {
  as?: "div" | "li";
  answered: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <Tag
      {...rest}
      data-answered={answered ? "" : undefined}
      className={cn(
        "comment-card group/card relative rounded-[2px] px-4 pt-8 pb-6 sm:px-7 sm:pb-8",
        className
      )}
    >
      <span aria-hidden className="card-pin" />
      {children}
    </Tag>
  );
}
