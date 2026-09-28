import { site } from "@/content/site";
import { previewableLink, siteHostAliases } from "@/lib/link-previews/rules";

/**
 * Regions whose links never get a card: site chrome (header, nav, footer) and
 * the home contact row, where every link is self-explanatory.
 */
const QUIET_REGIONS = "nav, header, footer, [data-contact]";

const siteHosts = siteHostAliases(site.url);

export type PreviewTarget = {
  anchor: HTMLAnchorElement;
  /** Key into the preview map. */
  key: string;
  external: boolean;
};

/**
 * The link under `element` that deserves a hover card: an `<a href>` inside
 * `main`, outside quiet regions, whose destination passes the rules in
 * lib/link-previews/rules.ts (no home, current page, anchors, mailto/tel,
 * WhatsApp, files or `/resume`).
 *
 * The nearest `data-preview` or `data-no-preview` (on the link or any
 * ancestor) wins over the region rules: `data-no-preview` silences a link or
 * a whole block, and `data-preview` lets a link in a quiet region (or outside
 * `main`) have its card. Neither overrides the destination rules, since those
 * links have no card to show.
 */
export function previewTarget(
  element: Element | null,
  main: Element | null
): PreviewTarget | null {
  const anchor = element?.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.hasAttribute("download")) return null;

  const choice = anchor.closest("[data-preview], [data-no-preview]");
  if (choice?.hasAttribute("data-no-preview")) return null;

  const optedIn = choice !== null;
  if (!optedIn && (!main?.contains(anchor) || anchor.closest(QUIET_REGIONS))) {
    return null;
  }

  const link = previewableLink(anchor.href, {
    origin: window.location.origin,
    siteHosts,
    currentPath: window.location.pathname,
  });
  return link ? { anchor, ...link } : null;
}
