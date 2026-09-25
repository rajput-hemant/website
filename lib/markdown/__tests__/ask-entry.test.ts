import { describe, expect, it } from "vitest";

import { site } from "@/content/site";
import type { Question } from "@/lib/data/types";

import { askEntryToMarkdown } from "../pages/ask";
import { questionExcerpt } from "../questions";

const question: Question = {
  id: "q1",
  slug: "a1b2c3d4",
  by: "visitor",
  body: "# How do you *really* pick a stack for a new project, and what would you change today?\n\n- asking for a friend",
  authorName: "Sam <script>",
  status: "published",
  replies: [
    {
      key: "r1",
      by: "owner",
      body: "Boring tools first.",
      createdAt: "2026-09-25T12:00:00Z",
      status: "published",
    },
    {
      key: "r2",
      by: "visitor",
      authorName: "Sam <script>",
      body: "Thanks!\nMakes sense.",
      createdAt: "2026-09-26T10:00:00Z",
      status: "published",
    },
    {
      key: "r3",
      by: "visitor",
      body: "Same question here.",
      createdAt: "2026-09-27T10:00:00Z",
      status: "published",
    },
  ],
  submittedAt: "2026-09-20T10:00:00Z",
  publishedAt: "2026-09-25T10:00:00Z",
  lastActivityAt: "2026-09-27T10:00:00Z",
};

describe("askEntryToMarkdown", () => {
  const markdown = askEntryToMarkdown(question);

  it("titles the entry with an escaped excerpt of the opening message", () => {
    expect(questionExcerpt(question)).toBe(
      "# How do you *really* pick a stack for a new project, and what would you change…"
    );
    expect(markdown.split("\n")[0]).toBe(
      "# \\# How do you \\*really\\* pick a stack for a new project, and what would you change…"
    );
  });

  it("links the canonical permalink and credits the visitor safely", () => {
    expect(markdown).toContain(
      `> Started by Sam \\<script> on Sep 25, 2026 · [${site.url.replace(/^https?:\/\//, "")}/ask/a1b2c3d4](${site.url}/ask/a1b2c3d4)`
    );
  });

  it("quotes the full opening message with its markdown kept literal", () => {
    expect(markdown).toContain(
      "> \\# How do you \\*really\\* pick a stack for a new project, and what would you change today?\n>\n> \\- asking for a friend"
    );
  });

  it("renders the replies in order, marking owner and visitor", () => {
    expect(markdown).toContain(
      [
        "## Replies",
        "",
        `- **${site.name} (owner)**, Sep 25, 2026: Boring tools first.`,
        "- **Sam \\<script> (visitor)**, Sep 26, 2026: Thanks!\\",
        "  Makes sense.",
        "- **Anonymous (visitor)**, Sep 27, 2026: Same question here.",
      ].join("\n")
    );
  });

  it("omits the replies heading when there are none", () => {
    expect(askEntryToMarkdown({ ...question, replies: [] })).not.toContain(
      "## Replies"
    );
  });

  it("credits an owner-started thread to the owner", () => {
    expect(
      askEntryToMarkdown({ ...question, by: "owner", authorName: undefined })
    ).toContain(`> Started by ${site.name} (owner) on Sep 25, 2026`);
  });
});

describe("visitor links", () => {
  const ZWSP = "​";
  const spammy: Question = {
    ...question,
    body: "Loved www.example.com, see https://spam.example/deal for more",
    authorName: "me@spam.example",
    replies: [
      {
        key: "r1",
        by: "visitor",
        authorName: "you@spam.example",
        body: "Also http://spam.example",
        createdAt: "2026-09-26T10:00:00Z",
        status: "published",
      },
    ],
  };
  const markdown = askEntryToMarkdown(spammy);

  it("never leaves a bare URL, domain or address to autolink", () => {
    expect(markdown).toContain(
      `Loved www${ZWSP}.example.com, see https:${ZWSP}//spam.example/deal`
    );
    expect(markdown).toContain(`Started by me@${ZWSP}spam.example`);
    expect(markdown).toContain(
      `**you@${ZWSP}spam.example (visitor)**, Sep 26, 2026: Also http:${ZWSP}//spam.example`
    );
  });

  it("keeps the site's own links live", () => {
    expect(markdown).toContain(`](${site.url}/ask/a1b2c3d4)`);
  });
});
