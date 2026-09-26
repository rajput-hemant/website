import { describe, expect, it } from "vitest";

import {
  breakAutolinks,
  codeSpan,
  escapeText,
  escapeUrl,
  escapeVisitorText,
  heading,
  link,
} from "../escape";

const ZWSP = "\u200B";

describe("escapeText", () => {
  it("leaves ordinary prose readable", () => {
    const prose =
      "Next.js, e.g. 3 - 4 = -1, a -> b, snake_case & 100% (really)!";
    expect(escapeText(prose)).toBe(prose);
  });

  it("escapes inline syntax anywhere in the line", () => {
    expect(escapeText("*a* `b` [c](d) <e> ~f~ \\g")).toBe(
      "\\*a\\* \\`b\\` \\[c\\](d) \\<e> \\~f\\~ \\\\g"
    );
  });

  it("escapes underscores only at word boundaries", () => {
    expect(escapeText("_lead_ snake_case trail_")).toBe(
      "\\_lead\\_ snake_case trail\\_"
    );
  });

  it("keeps character references literal", () => {
    expect(escapeText("&amp; &#169; & AT&T")).toBe("\\&amp; \\&#169; & AT&T");
  });

  it("guards block syntax only at the start of a line", () => {
    expect(escapeText("# not a heading", true)).toBe("\\# not a heading");
    expect(escapeText("- not a list", true)).toBe("\\- not a list");
    expect(escapeText("+ not a list", true)).toBe("\\+ not a list");
    expect(escapeText("2026. A year", true)).toBe("2026\\. A year");
    expect(escapeText("1) Item", true)).toBe("1\\) Item");
    expect(escapeText("> not a quote", true)).toBe("\\> not a quote");
    expect(escapeText("---", true)).toBe("\\---");
    expect(escapeText("#hashtag", true)).toBe("#hashtag");
    expect(escapeText("# mid-line")).toBe("# mid-line");
  });

  it("drops leading indentation so it cannot become a code block", () => {
    expect(escapeText("    indented", true)).toBe("indented");
  });

  it("turns newlines into hard breaks and guards the next line", () => {
    expect(escapeText("one\n- two")).toBe("one\\\n\\- two");
  });
});

describe("breakAutolinks", () => {
  it("defuses bare URLs, www domains and email addresses", () => {
    expect(breakAutolinks("see https://evil.example/x and HTTP://a.b")).toBe(
      `see https:${ZWSP}//evil.example/x and HTTP:${ZWSP}//a.b`
    );
    expect(breakAutolinks("visit www.evil.example or WWW.x.io")).toBe(
      `visit www${ZWSP}.evil.example or WWW${ZWSP}.x.io`
    );
    expect(breakAutolinks("mail me@evil.example or mailto:a@b.co")).toBe(
      `mail me@${ZWSP}evil.example or mailto:a@${ZWSP}b.co`
    );
  });

  it("leaves text without autolinks untouched", () => {
    const prose = "Next.js at 9:30, a www-like word, @handle, wwwx.y and a: b";
    expect(breakAutolinks(prose)).toBe(prose);
  });

  it("produces text no GFM autolink pattern matches", () => {
    const defused = breakAutolinks(
      "https://a.io www.b.io c@d.io ftp://e.io xmpp:f@g.io"
    );
    expect(defused).not.toMatch(/[a-z]:\/\//i);
    expect(defused).not.toMatch(/\bwww\./i);
    expect(defused).not.toMatch(/[\w.+-]@[\w-]/);
  });
});

describe("escapeVisitorText", () => {
  it("escapes markdown and defuses links", () => {
    expect(escapeVisitorText("*buy* at https://x.io", true)).toBe(
      `\\*buy\\* at https:${ZWSP}//x.io`
    );
  });
});

describe("codeSpan", () => {
  it("fences with more backticks than the content holds", () => {
    expect(codeSpan("npm i")).toBe("`npm i`");
    expect(codeSpan("a `b` c")).toBe("``a `b` c``");
    expect(codeSpan("`tick")).toBe("`` `tick ``");
  });
});

describe("escapeUrl and link", () => {
  it("percent-encodes characters that would end the destination", () => {
    expect(escapeUrl(" https://x.dev/a (b)\\<c> ")).toBe(
      "https://x.dev/a%20%28b%29%5C%3Cc%3E"
    );
  });

  it("escapes the label", () => {
    expect(link("[beta] *new*", "https://x.dev")).toBe(
      "[\\[beta\\] \\*new\\*](https://x.dev)"
    );
  });
});

describe("heading", () => {
  it("escapes a trailing run of hashes that would close the heading", () => {
    expect(heading(2, "Why C #")).toBe("## Why C \\#");
    expect(heading(2, "C#")).toBe("## C#");
  });
});
