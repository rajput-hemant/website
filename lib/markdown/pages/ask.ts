import { sitePage } from "@/content/site";
import { getSiteIdentity } from "@/lib/data";
import type { ChatReply, Question } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";
import { absoluteUrl } from "@/lib/url";

import {
  bulletList,
  markdownDocument,
  markdownUrl,
  metaLine,
} from "../document";
import {
  breakAutolinks,
  escapeText,
  escapeVisitorText,
  heading,
  link,
} from "../escape";
import {
  getAllPublishedQuestions,
  questionDate,
  questionExcerpt,
} from "../questions";

const ANONYMOUS = "Anonymous";

/**
 * Visitor text is plain: blank lines split paragraphs, markdown in it stays
 * literal, and URLs in it never become links.
 */
function plainTextToMarkdown(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => escapeVisitorText(paragraph.trim(), true))
    .join("\n\n");
}

/** The entry's title: visitor text, so defused before the caller escapes it. */
function entryTitle(question: Question): string {
  return breakAutolinks(questionExcerpt(question));
}

function quote(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => (line === "" ? ">" : `> ${line}`))
    .join("\n");
}

type Message = Pick<ChatReply, "by" | "authorName">;

/** The owner's name is trusted; a visitor's is defused like the rest of their text. */
function authorLabel(message: Message, owner: string): string {
  return message.by === "owner"
    ? `${escapeText(owner)} (owner)`
    : `${escapeVisitorText(message.authorName ?? ANONYMOUS)} (visitor)`;
}

/** Plain text for the front line, which the document escapes itself. */
function startedBy(question: Question, owner: string): string {
  const author =
    question.by === "owner"
      ? `${owner} (owner)`
      : breakAutolinks(question.authorName ?? ANONYMOUS);
  return `Started by ${author} on ${formatTimestamp(questionDate(question))}`;
}

function replyItem(reply: ChatReply, owner: string): string {
  const body = plainTextToMarkdown(reply.body).replace(/\n/g, "\n  ");
  return `**${authorLabel(reply, owner)}**, ${escapeText(formatTimestamp(reply.createdAt))}: ${body}`;
}

function replyCount(question: Question): string {
  const count = question.replies.length;
  if (count === 0) return "No replies yet";
  return `${count} ${count === 1 ? "reply" : "replies"}`;
}

/** `owner` is the resolved site name (`getSiteIdentity().name`). */
export function askEntryToMarkdown(question: Question, owner: string): string {
  const truncated = questionExcerpt(question) !== question.body.trim();

  return markdownDocument({
    title: entryTitle(question),
    path: `/ask/${question.slug}`,
    summary: startedBy(question, owner),
    sections: [
      truncated && quote(plainTextToMarkdown(question.body)),
      question.replies.length > 0 && "## Replies",
      bulletList(question.replies.map((reply) => replyItem(reply, owner))),
      link("All conversations", markdownUrl("/ask")),
    ],
  });
}

export async function askToMarkdown(): Promise<string> {
  const [questions, site] = await Promise.all([
    getAllPublishedQuestions(),
    getSiteIdentity(),
  ]);
  const page = sitePage("/ask");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: [
      `Conversations with visitors, latest activity first. Every visitor message is read before it is published. To start one or reply, use ${link("the ask page", absoluteUrl(page.path))}.`,
      questions.length === 0 && "No published conversations yet.",
      ...questions.map((question) =>
        [
          heading(
            2,
            link(entryTitle(question), markdownUrl(`/ask/${question.slug}`))
          ),
          metaLine([
            `Started by ${authorLabel(question, site.name)}`,
            escapeText(formatTimestamp(questionDate(question))),
            replyCount(question),
            question.replies.length > 0 &&
              `last activity ${escapeText(formatTimestamp(question.lastActivityAt))}`,
          ]),
        ].join("\n\n")
      ),
    ],
  });
}
