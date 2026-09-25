import type { LinkPreviewMap } from "@/lib/link-previews/types";

let request: Promise<LinkPreviewMap> | null = null;

/** Fetches `/link-previews.json` on first call and shares the result; a failure yields an empty map. */
export function loadLinkPreviews(): Promise<LinkPreviewMap> {
  request ??= fetch("/link-previews.json")
    .then((response) =>
      response.ok ? (response.json() as Promise<LinkPreviewMap>) : {}
    )
    .catch(() => ({}));
  return request;
}
