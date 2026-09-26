/** Reads and writes the /projects stack filter as `#stack=<slug>` in the URL hash. */
const PREFIX = "stack=";

/** Any other hash, such as a project anchor, is not a filter and reads as none. */
export function parseStackHash(hash: string): string | null {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith(PREFIX)) return null;
  return decodeURIComponent(raw.slice(PREFIX.length)) || null;
}

/** The hash for a stack filter, without `#`; empty when nothing is filtered. */
export function stackHash(slug: string | null): string {
  return slug ? `${PREFIX}${encodeURIComponent(slug)}` : "";
}
