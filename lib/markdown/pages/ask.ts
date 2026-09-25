import { site, sitePage } from "@/content/site";
import type { Question } from "@/lib/data/types";
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
import { portableTextToMarkdown } from "../portable-text";
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

function askedBy(question: Question): string {
  return `Asked by ${question.authorName ?? ANONYMOUS} on ${formatTimestamp(questionDate(question))}`;
}

function replyItem(
  question: Question,
  reply: Question["replies"][number]
): string {
  const author =
    reply.by === "owner" ? site.name : (question.authorName ?? ANONYMOUS);
  const body = plainTextToMarkdown(reply.body).replace(/\n/g, "\n  ");
  return `**${escapeVisitorText(author)}**, ${escapeText(formatTimestamp(reply.createdAt))}: ${body}`;
}

export function askEntryToMarkdown(question: Question): string {
  const truncated = questionExcerpt(question) !== question.body.trim();

  return markdownDocument({
    title: entryTitle(question),
    path: `/ask/${question.slug}`,
    summary: breakAutolinks(askedBy(question)),
    sections: [
      truncated && quote(plainTextToMarkdown(question.body)),
      question.answer && `## Answer from ${escapeText(site.name)}`,
      question.answer && portableTextToMarkdown(question.answer),
      question.replies.length > 0 && "## Follow-ups",
      bulletList(question.replies.map((reply) => replyItem(question, reply))),
      link("All questions", markdownUrl("/ask")),
    ],
  });
}

export async function askToMarkdown(): Promise<string> {
  const questions = await getAllPublishedQuestions();
  const page = sitePage("/ask");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: [
      `Questions and messages people have sent me, with my answers. Every entry is read before it is published. To ask something, use the form on ${link("the ask page", absoluteUrl(page.path))}.`,
      questions.length === 0 && "No published entries yet.",
      ...questions.map((question) =>
        [
          heading(
            2,
            link(entryTitle(question), markdownUrl(`/ask/${question.slug}`))
          ),
          metaLine([
            escapeVisitorText(askedBy(question)),
            question.answer ? "Answered" : "Awaiting an answer",
          ]),
        ].join("\n\n")
      ),
    ],
  });
}
