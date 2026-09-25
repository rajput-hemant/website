import {
  normalizeExternalUrl,
  normalizeInternalPath,
} from "@/lib/link-previews/url";

/** Chrome and opt-outs: links here never get a card. */
const EXCLUDED = "nav, header, footer, [data-no-preview]";

export type PreviewTarget = {
  anchor: HTMLAnchorElement;
  /** Key into the preview map. */
  key: string;
  external: boolean;
};

/**
 * The link under `element` that deserves a hover card: an `<a href>` inside
 * `main`, outside navigation chrome and `data-no-preview`, pointing at another
 * page over http(s). Same-page anchors, downloads and `mailto:` are skipped.
 */
export function previewTarget(
  element: Element | null,
  main: Element | null
): PreviewTarget | null {
  const anchor = element?.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement) || !main?.contains(anchor)) {
    return null;
  }
  if (anchor.closest(EXCLUDED) || anchor.hasAttribute("download")) return null;

  const url = new URL(anchor.href);
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  if (url.origin === window.location.origin) {
    const key = normalizeInternalPath(url.pathname);
    if (key === normalizeInternalPath(window.location.pathname)) return null;
    return { anchor, key, external: false };
  }

  const key = normalizeExternalUrl(url.href);
  return key ? { anchor, key, external: true } : null;
}
