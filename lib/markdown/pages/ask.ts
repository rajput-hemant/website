import { site } from "@/content/site";
import type { Question } from "@/lib/data/types";

import {
  absoluteUrl,
  bulletList,
  formatDay,
  markdownDocument,
  markdownUrl,
  metaLine,
} from "../document";
import { escapeText, heading, link } from "../escape";
import { portableTextToMarkdown } from "../portable-text";
import {
  getAllPublishedQuestions,
  questionDate,
  questionExcerpt,
} from "../questions";
import { pageInfo } from "./page-info";

const ANONYMOUS = "Anonymous";

/** Visitor text is plain: blank lines split paragraphs, and markdown in it stays literal. */
function plainTextToMarkdown(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => escapeText(paragraph.trim(), true))
    .join("\n\n");
}

function quote(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => (line === "" ? ">" : `> ${line}`))
    .join("\n");
}

function askedBy(question: Question): string {
  return `Asked by ${question.authorName ?? ANONYMOUS} on ${formatDay(questionDate(question))}`;
}

function replyItem(
  question: Question,
  reply: Question["replies"][number]
): string {
  const author =
    reply.by === "owner" ? site.name : (question.authorName ?? ANONYMOUS);
  const body = plainTextToMarkdown(reply.body).replace(/\n/g, "\n  ");
  return `**${escapeText(author)}**, ${escapeText(formatDay(reply.createdAt))}: ${body}`;
}

export function askEntryToMarkdown(question: Question): string {
  const excerpt = questionExcerpt(question);
  const truncated = excerpt !== question.body.trim();

  return markdownDocument({
    title: excerpt,
    path: `/ask/${question.slug}`,
    summary: askedBy(question),
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
  const page = pageInfo("/ask");

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
            link(
              questionExcerpt(question),
              markdownUrl(`/ask/${question.slug}`)
            )
          ),
          metaLine([
            escapeText(askedBy(question)),
            question.answer ? "Answered" : "Awaiting an answer",
          ]),
        ].join("\n\n")
      ),
    ],
  });
}
