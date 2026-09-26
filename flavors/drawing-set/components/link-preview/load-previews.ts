import type { LinkPreviewMap } from "@/lib/link-previews/types";

let request: Promise<LinkPreviewMap> | null = null;

/** Fetches `/link-previews.json` on first call and shares the result; a failure yields an empty map. */
export function loadLinkPreviews(): Promise<LinkPreviewMap> {
  request ??= fetch("/link-previews.json")
    .then(async (response) => {
      if (response.ok) return response.json() as Promise<LinkPreviewMap>;
      // Release the unread body, or Chromium keeps the request open.
      await response.body?.cancel();
      return {};
    })
    .catch(() => ({}));
  return request;
}
