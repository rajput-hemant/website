import type { LinkPreview } from "./types";

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 240;
const MAX_SITE_NAME_LENGTH = 60;

const TITLE_KEYS = ["og:title", "twitter:title"];
const DESCRIPTION_KEYS = [
  "og:description",
  "twitter:description",
  "description",
];
const IMAGE_KEYS = [
  "og:image:secure_url",
  "og:image:url",
  "og:image",
  "twitter:image",
  "twitter:image:src",
];
const SITE_NAME_KEYS = ["og:site_name", "application-name"];

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  middot: "·",
  bull: "•",
  copy: "©",
  reg: "®",
  trade: "™",
};

const ATTRIBUTE =
  /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (entity, body: string) => {
      if (body[0] === "#") {
        const code =
          body[1] === "x" || body[1] === "X"
            ? Number.parseInt(body.slice(2), 16)
            : Number.parseInt(body.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : entity;
      }
      return NAMED_ENTITIES[body.toLowerCase()] ?? entity;
    }
  );
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function clean(value: string | undefined, max: number): string | undefined {
  if (!value) return undefined;
  const text = decodeEntities(value).replace(/\s+/g, " ").trim();
  return text ? truncate(text, max) : undefined;
}

function parseAttributes(source: string): Map<string, string> {
  const attributes = new Map<string, string>();
  for (const match of source.matchAll(ATTRIBUTE)) {
    const name = match[1]?.toLowerCase();
    if (!name || attributes.has(name)) continue;
    attributes.set(name, match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

/** Everything a card could need sits in <head>; comments and scripts could fake matches. */
function headOf(html: string): string {
  const headEnd = html.search(/<\/head\s*>/i);
  const head = headEnd === -1 ? html : html.slice(0, headEnd);
  return head
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, "");
}

function collectMeta(head: string): Map<string, string> {
  const meta = new Map<string, string>();
  for (const match of head.matchAll(/<meta\b([^>]*)>/gi)) {
    const attributes = parseAttributes(match[1] ?? "");
    const key = (
      attributes.get("property") ??
      attributes.get("name") ??
      attributes.get("itemprop")
    )
      ?.trim()
      .toLowerCase();
    const content = attributes.get("content");
    if (!key || content === undefined || meta.has(key)) continue;
    meta.set(key, content);
  }
  return meta;
}

function firstOf(meta: Map<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = meta.get(key)?.trim();
    if (value) return value;
  }
  return undefined;
}

function linkHref(head: string, rel: string): string | undefined {
  for (const match of head.matchAll(/<link\b([^>]*)>/gi)) {
    const attributes = parseAttributes(match[1] ?? "");
    const rels = attributes.get("rel")?.toLowerCase().split(/\s+/) ?? [];
    if (rels.includes(rel)) return attributes.get("href");
  }
  return undefined;
}

function resolveHttpUrl(value: string, base: string): string | undefined {
  try {
    const url = new URL(decodeEntities(value.trim()), base);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

function documentBase(head: string, pageUrl: string): string {
  const match = /<base\b([^>]*)>/i.exec(head);
  const href = match && parseAttributes(match[1] ?? "").get("href");
  return (href && resolveHttpUrl(href, pageUrl)) ?? pageUrl;
}

/**
 * Reads a page's Open Graph, Twitter card and plain <title>/<meta description>
 * tags into a preview. Pure: `pageUrl` (the final URL after redirects) is only
 * used to resolve relative image URLs.
 */
export function parseLinkPreview(html: string, pageUrl: string): LinkPreview {
  const head = headOf(html);
  const meta = collectMeta(head);
  const base = documentBase(head, pageUrl);

  const documentTitle = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(head)?.[1];
  const rawImage = firstOf(meta, IMAGE_KEYS) ?? linkHref(head, "image_src");

  const preview: LinkPreview = {
    title: clean(firstOf(meta, TITLE_KEYS) ?? documentTitle, MAX_TITLE_LENGTH),
    description: clean(firstOf(meta, DESCRIPTION_KEYS), MAX_DESCRIPTION_LENGTH),
    image: rawImage ? resolveHttpUrl(rawImage, base) : undefined,
    siteName: clean(firstOf(meta, SITE_NAME_KEYS), MAX_SITE_NAME_LENGTH),
  };

  return Object.fromEntries(
    Object.entries(preview).filter(([, value]) => value !== undefined)
  ) as LinkPreview;
}
