import { describe, expect, it } from "vitest";

import type { RichText } from "@/lib/data/types";

import { portableTextToMarkdown } from "../portable-text";

type SpanInput = { text: string; marks?: string[] };
type BlockOptions = {
  markDefs?: { _key: string; _type: string; href?: string }[];
  listItem?: "bullet" | "number";
  level?: number;
};

let keySeed = 0;
const key = () => `k${keySeed++}`;

function block(spans: (string | SpanInput)[], options: BlockOptions = {}) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: options.markDefs ?? [],
    ...(options.listItem
      ? { listItem: options.listItem, level: options.level ?? 1 }
      : {}),
    children: spans.map((span) => {
      const { text, marks = [] } =
        typeof span === "string" ? { text: span } : span;
      return { _type: "span", _key: key(), text, marks };
    }),
  };
}

const md = (...blocks: unknown[]) => portableTextToMarkdown(blocks as RichText);

describe("portableTextToMarkdown", () => {
  it("separates paragraphs with a blank line", () => {
    expect(md(block(["First."]), block(["Second."]))).toBe("First.\n\nSecond.");
  });

  it("returns an empty string for no content", () => {
    expect(md()).toBe("");
  });

  it("renders strong, em and code", () => {
    expect(
      md(
        block([
          "I ",
          { text: "build", marks: ["strong"] },
          " ",
          { text: "fast", marks: ["em"] },
          " apps with ",
          { text: "next build", marks: ["code"] },
          ".",
        ])
      )
    ).toBe("I **build** *fast* apps with `next build`.");
  });

  it("nests marks that span several spans", () => {
    expect(
      md(
        block([
          { text: "bold ", marks: ["strong"] },
          { text: "and italic", marks: ["strong", "em"] },
        ])
      )
    ).toBe("**bold *and italic***");
  });

  it("keeps whitespace outside emphasis delimiters", () => {
    expect(md(block(["a", { text: " b ", marks: ["strong"] }, "c"]))).toBe(
      "a **b** c"
    );
  });

  it("drops marks around empty text", () => {
    expect(md(block(["a", { text: " ", marks: ["em"] }, "b"]))).toBe("a b");
  });

  it("renders links from mark definitions and escapes the URL", () => {
    expect(
      md(
        block(["See ", { text: "the docs", marks: ["l1"] }, "."], {
          markDefs: [
            { _key: "l1", _type: "link", href: "https://x.dev/a (b)" },
          ],
        })
      )
    ).toBe("See [the docs](https://x.dev/a%20%28b%29).");
  });

  it("renders marks inside a link", () => {
    expect(
      md(
        block([{ text: "Zunta", marks: ["l1", "strong"] }], {
          markDefs: [{ _key: "l1", _type: "link", href: "https://zunta.com" }],
        })
      )
    ).toBe("[**Zunta**](https://zunta.com)");
  });

  it("renders a link without an href as plain text", () => {
    expect(
      md(
        block([{ text: "orphan", marks: ["l1"] }], {
          markDefs: [{ _key: "l1", _type: "link" }],
        })
      )
    ).toBe("orphan");
  });

  it("does not escape inside code", () => {
    expect(md(block([{ text: "a*b_c `d`", marks: ["code"] }]))).toBe(
      "`` a*b_c `d` ``"
    );
  });

  it("escapes markdown-significant text", () => {
    expect(md(block(["1. Not a list, *not* emphasis, [not] a link"]))).toBe(
      "1\\. Not a list, \\*not\\* emphasis, \\[not\\] a link"
    );
  });

  it("only guards block syntax at the start of the block", () => {
    expect(md(block([{ text: "Bold", marks: ["strong"] }, " # 1. - ok"]))).toBe(
      "**Bold** # 1. - ok"
    );
  });

  it("turns soft line breaks into hard breaks", () => {
    expect(md(block(["one\n# two\n"]))).toBe("one\\\n\\# two");
  });

  it("renders bullet and numbered lists", () => {
    expect(
      md(
        block(["Intro"]),
        block(["Alpha"], { listItem: "bullet" }),
        block(["Beta"], { listItem: "bullet" }),
        block(["First"], { listItem: "number" }),
        block(["Second"], { listItem: "number" }),
        block(["Outro"])
      )
    ).toBe("Intro\n\n- Alpha\n- Beta\n\n1. First\n2. Second\n\nOutro");
  });

  it("indents nested lists to the parent item's content", () => {
    expect(
      md(
        block(["One"], { listItem: "number" }),
        block(["Nested"], { listItem: "bullet", level: 2 }),
        block(["Deeper"], { listItem: "number", level: 3 }),
        block(["Two"], { listItem: "number" })
      )
    ).toBe("1. One\n   - Nested\n     1. Deeper\n2. Two");
  });

  it("guards list item text that looks like block syntax", () => {
    expect(md(block(["- dash"], { listItem: "bullet" }))).toBe("- \\- dash");
  });

  it("skips unknown block types", () => {
    expect(md({ _type: "image", _key: "img" }, block(["After"]))).toBe("After");
  });
});
