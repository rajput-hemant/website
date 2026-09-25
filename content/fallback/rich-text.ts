import type { PortableTextBlock } from "@portabletext/react";

import type { RichText } from "@/lib/data/types";

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type LinkMark = { _type: "link"; _key: string; href: string };

const DECORATORS = { "**": "strong", "*": "em", "`": "code" } as const;

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/;
const LINK_TOKEN = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/** FNV-1a, base36: short, deterministic keys that survive re-seeding. */
function hash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function parseToken(token: string): {
  text: string;
  mark?: string;
  href?: string;
} {
  const link = LINK_TOKEN.exec(token);
  if (link?.[1] && link[2]) return { text: link[1], href: link[2] };

  for (const [delimiter, mark] of Object.entries(DECORATORS)) {
    const wrapped =
      token.length > delimiter.length * 2 &&
      token.startsWith(delimiter) &&
      token.endsWith(delimiter);
    if (wrapped)
      return { text: token.slice(delimiter.length, -delimiter.length), mark };
  }

  return { text: token };
}

/**
 * Builds one Portable Text paragraph from a light inline markup:
 * `**strong**`, `*em*`, `` `code` `` and `[label](https://url)`. Marks do not nest.
 */
export function paragraph(markup: string): PortableTextBlock {
  const blockKey = hash(markup);
  const children: Span[] = [];
  const markDefs: LinkMark[] = [];

  markup
    .split(INLINE_TOKEN)
    .filter((part) => part !== "")
    .forEach((part, index) => {
      const { text, mark, href } = parseToken(part);
      const marks: string[] = [];
      if (mark) marks.push(mark);
      if (href) {
        const markKey = `${blockKey}l${markDefs.length}`;
        markDefs.push({ _type: "link", _key: markKey, href });
        marks.push(markKey);
      }
      children.push({
        _type: "span",
        _key: `${blockKey}s${index}`,
        text,
        marks,
      });
    });

  return {
    _type: "block",
    _key: blockKey,
    style: "normal",
    markDefs,
    children,
  };
}

/** One paragraph per argument. */
export function richText(...paragraphs: string[]): RichText {
  return paragraphs.map(paragraph);
}
