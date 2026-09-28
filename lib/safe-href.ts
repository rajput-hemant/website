/**
 * The one gate every CMS-provided link passes before it becomes an `href`:
 * rich-text link marks, profile socials, the hosted resume, company, project,
 * now and update links. Studio validation restricts schemes, but documents can
 * be written through the API, so the site checks again when it renders.
 *
 * Allowed: `http:`, `https:`, `mailto:`, `tel:`, and same-site relative paths
 * that start with `/`, `#`, `?` or `.` (`/work`, `#top`, `?q=1`, `./x`).
 * Everything else (`javascript:`, `data:`, `vbscript:`, protocol-relative
 * `//host`, bare `example.com`, backslash tricks, control characters) is
 * dropped.
 */

/** `rel` for any link that leaves the site. */
export const EXTERNAL_REL = "noopener noreferrer";

const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/** RFC 3986 scheme followed by a colon. */
const SCHEME = /^([a-z][a-z\d+.-]*):/i;

/**
 * C0 controls, DEL and the C1 range. The URL parser strips tabs and newlines
 * anywhere and controls at the ends, so `java\tscript:` would run as
 * `javascript:`; no legitimate link carries these.
 */
function hasControl(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

/**
 * `raw` as a safe `href`, or `undefined` when it is empty, not a string, or
 * not on the allowlist. The accepted value is returned trimmed and otherwise
 * unchanged, so rendered markup matches what the CMS stores.
 */
export function safeHref(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const href = raw.trim();
  if (href === "" || hasControl(href) || href.includes("\\")) {
    return undefined;
  }

  const scheme = SCHEME.exec(href)?.[1];
  if (scheme === undefined) {
    // Relative. `//host` is protocol-relative, so it would leave the site,
    // and a bare `example.com` is almost always a URL missing its scheme.
    if (href.startsWith("//") || !/^[/#?.]/.test(href)) return undefined;
    return href;
  }
  if (!SAFE_SCHEMES.has(`${scheme.toLowerCase()}:`)) return undefined;
  // The parser repairs `https:host`, `http:/host` and `http:///host` into a
  // host; a CMS link that malformed is refused rather than guessed at.
  if (/^https?:/i.test(href) && !/^https?:\/\/[^/]/i.test(href)) {
    return undefined;
  }

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return undefined;
  }
  if (url.protocol === "http:" || url.protocol === "https:") {
    // Needs a host, and no `user@` part (`https://site.com@evil.example`).
    if (url.hostname === "" || url.username !== "" || url.password !== "") {
      return undefined;
    }
    return href;
  }
  // `mailto:` and `tel:` need something after the colon.
  return url.pathname === "" ? undefined : href;
}

/**
 * True for a same-site link that client-side navigation can handle. Expects a
 * value already accepted by `safeHref`; checks again so a raw string can never
 * reach `next/link` as a protocol-relative URL.
 */
export function isInternalHref(href: string): boolean {
  return safeHref(href) === href && !SCHEME.test(href);
}

/**
 * True for a link that opens another site (http or https), which gets
 * `target="_blank"` and `EXTERNAL_REL`. `mailto:` and `tel:` hand off to an app
 * instead and are neither internal nor external.
 */
export function isExternalHref(href: string): boolean {
  return /^https?:/i.test(href) && safeHref(href) === href;
}

/**
 * `<a>` attributes for a CMS value: the checked `href`, plus `EXTERNAL_REL` when
 * it leaves the site. Empty when `safeHref` rejects it, so the anchor renders
 * as plain text. Spread it in place of `href`.
 */
export function hrefProps(raw: unknown): { href?: string; rel?: string } {
  const href = safeHref(raw);
  if (href === undefined) return {};
  return isExternalHref(href) ? { href, rel: EXTERNAL_REL } : { href };
}

type MarkDef = { _type: string; _key: string; [field: string]: unknown };

/** Drops `null` and other non-object entries a hand-written document can hold. */
function isMarkDef(value: unknown): value is MarkDef {
  return (
    typeof value === "object" &&
    value !== null &&
    "_type" in value &&
    typeof value._type === "string" &&
    "_key" in value &&
    typeof value._key === "string"
  );
}

/** A link mark definition with its `href` checked, or dropped when unsafe. */
function safeMarkDef(def: MarkDef): MarkDef {
  if (def._type !== "link" || !("href" in def)) return def;
  const { href, ...rest } = def;
  const safe = safeHref(href);
  return safe === undefined ? rest : { ...rest, href: safe };
}

/**
 * Portable Text with every link mark's `href` run through `safeHref`. An
 * unsafe mark keeps its text and loses its `href`, which every renderer draws
 * as plain text. Malformed mark definitions (`null`, no `_type` or `_key`)
 * are dropped instead of throwing. Other blocks and marks pass through.
 */
export function sanitizeRichText<
  T extends { _type: string; markDefs?: unknown[] | null | undefined },
>(blocks: T[]): T[] {
  return blocks.map((block) =>
    Array.isArray(block.markDefs)
      ? {
          ...block,
          markDefs: block.markDefs.filter(isMarkDef).map(safeMarkDef),
        }
      : block
  );
}
