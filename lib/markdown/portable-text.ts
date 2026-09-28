import type { PortableTextBlock } from "@portabletext/react";
import {
  buildMarksTree,
  isPortableTextBlock,
  isPortableTextToolkitList,
  isPortableTextToolkitSpan,
  isPortableTextToolkitTextNode,
  nestLists,
  spanToPlainText,
  type ToolkitNestedPortableTextSpan,
  type ToolkitPortableTextDirectList,
} from "@portabletext/toolkit";

import type { RichText } from "@/lib/data/types";

import { codeSpan, escapeText, escapeUrl } from "./escape";

type InlineNode = ReturnType<typeof buildMarksTree>[number];
type TypedObject = { _type: string; _key?: string };

/** Tracks whether the next text starts a line, where block syntax can trigger. */
type InlineState = { atLineStart: boolean };

const DELIMITERS: Record<string, string> = { strong: "**", em: "*" };

/** Emphasis cannot open or close on whitespace, so keep it outside the delimiters. */
function wrap(content: string, delimiter: string): string {
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(content);
  const [, leading = "", inner = "", trailing = ""] = match ?? [];
  if (inner === "") return content;
  return `${leading}${delimiter}${inner}${delimiter}${trailing}`;
}

function renderSpan(
  span: ToolkitNestedPortableTextSpan,
  state: InlineState
): string {
  if (span.markType === "code") {
    state.atLineStart = false;
    return codeSpan(spanToPlainText(span));
  }

  const content = renderInline(span.children, state);
  const delimiter = DELIMITERS[span.markType];
  if (delimiter) return wrap(content, delimiter);

  const href = span.markDef?.href;
  if (span.markType === "link" && typeof href === "string" && href !== "") {
    return content.trim() === "" ? content : `[${content}](${escapeUrl(href)})`;
  }

  return content;
}

function renderInline(nodes: InlineNode[], state: InlineState): string {
  return nodes
    .map((node) => {
      if (isPortableTextToolkitTextNode(node)) {
        if (node.text === "\n") {
          state.atLineStart = true;
          return "\\\n";
        }
        const text = escapeText(node.text, state.atLineStart);
        if (node.text !== "") state.atLineStart = false;
        return text;
      }
      if (isPortableTextToolkitSpan(node)) return renderSpan(node, state);
      return "";
    })
    .join("");
}

const EDGE_BREAKS = /^(?:\\\n)+|(?:\\\n)+$/g;

function renderBlockText(block: PortableTextBlock): string {
  return renderInline(buildMarksTree(block), { atLineStart: true })
    .replace(EDGE_BREAKS, "")
    .trim();
}

function indent(text: string, width: number): string {
  const pad = " ".repeat(width);
  return text
    .split("\n")
    .map((line) => (line === "" ? line : pad + line))
    .join("\n");
}

/** Nested lists are indented to the parent item's content column, as CommonMark requires. */
function renderList(list: ToolkitPortableTextDirectList): string {
  const lines: string[] = [];
  let number = 0;
  let markerWidth = 2;

  for (const child of list.children) {
    if (isPortableTextToolkitList(child)) {
      if (child.mode === "direct")
        lines.push(indent(renderList(child), markerWidth));
      continue;
    }
    number += 1;
    const marker = list.listItem === "number" ? `${number}.` : "-";
    markerWidth = marker.length + 1;
    const text = renderBlockText(child);
    lines.push(
      `${marker} ${text.split("\n").join(`\n${" ".repeat(markerWidth)}`)}`
    );
  }

  return lines.join("\n");
}

function renderNode(
  node: PortableTextBlock | ToolkitPortableTextDirectList | TypedObject
): string {
  if (isPortableTextToolkitList(node)) {
    return node.mode === "direct" ? renderList(node) : "";
  }
  if (isPortableTextBlock(node)) return renderBlockText(node);
  return "";
}

/**
 * Serialises the site's Portable Text subset (paragraphs, strong, em, code,
 * links, bullet and numbered lists, nested lists) to CommonMark. Unknown block
 * types are skipped. Blocks are separated by a blank line.
 */
export function portableTextToMarkdown(value: RichText): string {
  return nestLists<PortableTextBlock | TypedObject>(value, "direct")
    .map(renderNode)
    .filter((chunk) => chunk !== "")
    .join("\n\n");
}
