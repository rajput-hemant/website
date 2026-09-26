import "server-only";

import { parseLinkPreview } from "./parse";
import type { LinkPreview } from "./types";

const TIMEOUT_MS = 4000;
/** Enough for any <head>; some pages stream megabytes of body after it. */
const MAX_BYTES = 512 * 1024;

const HEADERS = {
  accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
  "user-agent":
    "Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://github.com/rajput-hemant)",
};

async function readCapped(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let html = "";
  let bytes = 0;
  while (bytes < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    html += decoder.decode(value, { stream: true });
    if (/<\/head\s*>/i.test(html)) break;
  }
  await reader.cancel().catch(() => undefined);
  return html + decoder.decode();
}

/**
 * Fetches one page and reads its preview tags. Never throws: a timeout, a
 * blocked host, a non-HTML response or a parse failure all give `{}`, which
 * the card renders as text only.
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  try {
    const response = await fetch(url, {
      headers: HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "force-cache",
    });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/html/i.test(type)) {
      await response.body?.cancel().catch(() => undefined);
      return {};
    }
    const html = await readCapped(response);
    return parseLinkPreview(html, response.url || url);
  } catch {
    return {};
  }
}

/** Runs `task` over `items` with at most `limit` in flight, keeping input order. */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index] as T);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  );
  return results;
}
