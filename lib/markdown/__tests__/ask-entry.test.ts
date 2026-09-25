import { describe, expect, it } from "vitest";

import { site } from "@/content/site";
import type { Question } from "@/lib/data/types";

import { askEntryToMarkdown } from "../pages/ask";
import { questionExcerpt } from "../questions";

const question: Question = {
  id: "q1",
  slug: "a1b2c3d4",
  body: "# How do you *really* pick a stack for a new project, and what would you change today?\n\n- asking for a friend",
  authorName: "Sam <script>",
  status: "published",
  answer: [
    {
      _type: "block",
      _key: "b",
      style: "normal",
      markDefs: [],
      children: [
        { _type: "span", _key: "s", text: "Boring tools first.", marks: [] },
      ],
    },
  ],
  replies: [
    {
      by: "visitor",
      body: "Thanks!\nMakes sense.",
      createdAt: "2026-09-26T10:00:00Z",
    },
    { by: "owner", body: "Any time.", createdAt: "2026-09-27T10:00:00Z" },
  ],
  submittedAt: "2026-09-20T10:00:00Z",
  publishedAt: "2026-09-25T10:00:00Z",
};

describe("askEntryToMarkdown", () => {
  const markdown = askEntryToMarkdown(question);

  it("titles the entry with an escaped excerpt of the question", () => {
    expect(questionExcerpt(question)).toBe(
      "# How do you *really* pick a stack for a new project, and what would you change…"
    );
    expect(markdown.split("\n")[0]).toBe(
      "# \\# How do you \\*really\\* pick a stack for a new project, and what would you change…"
    );
  });

  it("links the canonical permalink and credits the visitor safely", () => {
    expect(markdown).toContain(
      `> Asked by Sam \\<script> on Sep 25, 2026 · [${site.url.replace(/^https?:\/\//, "")}/ask/a1b2c3d4](${site.url}/ask/a1b2c3d4)`
    );
  });

  it("quotes the full question with its markdown kept literal", () => {
    expect(markdown).toContain(
      "> \\# How do you \\*really\\* pick a stack for a new project, and what would you change today?\n>\n> \\- asking for a friend"
    );
  });

  it("renders the answer and follow-ups", () => {
    expect(markdown).toContain(
      `## Answer from ${site.name}\n\nBoring tools first.`
    );
    expect(markdown).toContain(
      "- **Sam \\<script>**, Sep 26, 2026: Thanks!\\\n  Makes sense.\n- **Hemant Rajput**, Sep 27, 2026: Any time."
    );
  });
});

describe("visitor links", () => {
  const ZWSP = "\u200B";
  const spammy: Question = {
    ...question,
    body: "Loved www.example.com, see https://spam.example/deal for more",
    authorName: "me@spam.example",
    answer: undefined,
    replies: [
      {
        by: "visitor",
        body: "Also http://spam.example",
        createdAt: "2026-09-26T10:00:00Z",
      },
    ],
  };
  const markdown = askEntryToMarkdown(spammy);

  it("never leaves a bare URL, domain or address to autolink", () => {
    expect(markdown).toContain(
      `Loved www${ZWSP}.example.com, see https:${ZWSP}//spam.example/deal`
    );
    expect(markdown).toContain(`Asked by me@${ZWSP}spam.example`);
    expect(markdown).toContain(
      `**me@${ZWSP}spam.example**, Sep 26, 2026: Also http:${ZWSP}//spam.example`
    );
  });

  it("keeps the site's own links live", () => {
    expect(markdown).toContain(`](${site.url}/ask/a1b2c3d4)`);
  });
});
