import { describe, expect, it } from "vitest";

import { codeSpan, escapeText, escapeUrl, heading, link } from "../escape";

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
