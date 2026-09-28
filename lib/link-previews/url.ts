import type { LinkPreview } from "./types";

/** GitHub paths that look like `/owner/repo` but aren't repositories. */
const GITHUB_RESERVED = new Set([
  "about",
  "apps",
  "collections",
  "enterprise",
  "explore",
  "features",
  "marketplace",
  "orgs",
  "settings",
  "sponsors",
  "topics",
  "users",
]);

/** The key an external URL has in the preview map: absolute, http(s), no fragment. */
export function normalizeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

/** The key an internal page has in the preview map: its path without a trailing slash. */
export function normalizeInternalPath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** `https://www.example.com/a` → `example.com`. */
export function displayDomain(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

/** GitHub renders a card for every public repository, even ones without an og:image of their own. */
export function githubOpenGraphImage(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.hostname !== "github.com") return undefined;
    const [owner, repo] = url.pathname.split("/").filter(Boolean);
    if (!owner || !repo || GITHUB_RESERVED.has(owner.toLowerCase())) {
      return undefined;
    }
    const name = repo.replace(/\.git$/, "");
    return `https://opengraph.githubassets.com/1/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  } catch {
    return undefined;
  }
}

export function withGithubFallback(
  url: string,
  preview: LinkPreview
): LinkPreview {
  if (preview.image) return preview;
  const image = githubOpenGraphImage(url);
  return image ? { ...preview, image } : preview;
}

type RichTextLike = readonly { markDefs?: readonly object[] | null }[];

/** Link targets inside Portable Text blocks. */
export function richTextHrefs(blocks: RichTextLike | undefined): string[] {
  if (!blocks) return [];
  return blocks.flatMap((block) =>
    (block.markDefs ?? []).flatMap((mark) =>
      "href" in mark && typeof mark.href === "string" ? [mark.href] : []
    )
  );
}
