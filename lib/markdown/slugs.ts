import { pages } from "@/content/site";
import { askConfig } from "@/lib/ask/config";

/** `/` → `index`, `/work` → `work`, `/ask/abc` → `ask/abc`. */
export function markdownSlug(path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "index" : trimmed;
}

export const pageSlugs: ReadonlySet<string> = new Set(
  pages.map((page) => markdownSlug(page.path))
);

const ASK_SLUG = new RegExp(`^[A-Za-z0-9_-]{${askConfig.slugLength}}$`);

/** Whether `slug` is shaped like an /ask permalink id, so malformed ones never reach the data layer. */
export function isAskSlug(slug: string): boolean {
  return ASK_SLUG.test(slug);
}

/** The /ask permalink id in a mirror slug like `ask/AbC123xy`, if it is one. */
export function askEntrySlug(slug: string): string | undefined {
  const [section, id, ...rest] = slug.split("/");
  return section === "ask" && id && rest.length === 0 && isAskSlug(id)
    ? id
    : undefined;
}

/**
 * Whether a mirror slug can exist: a page from `content/site.ts` or a
 * well-formed /ask permalink. Safe for the proxy (no data access).
 */
export function isMirrorSlug(slug: string): boolean {
  return pageSlugs.has(slug) || askEntrySlug(slug) !== undefined;
}
