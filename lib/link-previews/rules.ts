import { normalizeExternalUrl, normalizeInternalPath } from "./url";

/**
 * Which links earn a hover card. A card has to add something the link text
 * doesn't already say, so these never get one:
 * - the home page, under the site's own origin or any of its host aliases;
 * - the page you're already on, including its `#` anchors;
 * - `mailto:`, `tel:` and anything else that isn't http(s);
 * - WhatsApp chats;
 * - files (PDFs and other downloads, hosted file links) and `/resume`, the
 *   printable view.
 * Internal subpages and external content pages (repos, articles, company
 * sites) do. Shared by the hover layer and the build of the preview map, so
 * the map never carries an entry the layer would refuse to show.
 */

/** Paths on this site whose card would only repeat the link. */
const NO_PREVIEW_PATHS = ["/", "/resume"];

const WHATSAPP_HOSTS = new Set([
  "wa.me",
  "whatsapp.com",
  "www.whatsapp.com",
  "api.whatsapp.com",
  "web.whatsapp.com",
  "chat.whatsapp.com",
]);

const FILE_EXTENSION =
  /\.(pdf|zip|gz|tgz|rar|7z|docx?|pptx?|xlsx?|odt|csv|txt|md|rtf|epub|png|jpe?g|gif|webp|avif|svg|mp3|mp4|mov|webm)$/i;

export type LinkContext = {
  /** Origin the page is served from; relative hrefs resolve against it. */
  origin: string;
  /** Hostnames that are this site wherever it is served (see `siteHostAliases`). */
  siteHosts: readonly string[];
  /** The current page's path; links to it get no card. */
  currentPath?: string;
};

export type PreviewableLink = {
  /** Key into the preview map: an internal path or a normalised URL. */
  key: string;
  external: boolean;
};

/** `example.com` and `www.example.com`, whichever of the two `siteUrl` names. */
export function siteHostAliases(siteUrl: string): string[] {
  try {
    const host = new URL(siteUrl).hostname;
    const bare = host.replace(/^www\./, "");
    return bare === host ? [host, `www.${host}`] : [host, bare];
  } catch {
    return [];
  }
}

function isFile(url: URL): boolean {
  if (FILE_EXTENSION.test(url.pathname)) return true;
  // Hosted file viewers (a resume on Google Drive, say) show a file, not a page.
  if (url.hostname === "drive.google.com" && url.pathname.startsWith("/file/"))
    return true;
  return (
    url.hostname === "docs.google.com" && /\/(export|pub)$/.test(url.pathname)
  );
}

function isInternal(url: URL, context: LinkContext): boolean {
  return (
    url.origin === context.origin || context.siteHosts.includes(url.hostname)
  );
}

function isQuietPath(path: string): boolean {
  return NO_PREVIEW_PATHS.some(
    (quiet) => path === quiet || (quiet !== "/" && path.startsWith(`${quiet}/`))
  );
}

/**
 * The preview-map key for `href` when a card would add information, or null
 * when the link should stay plain.
 */
export function previewableLink(
  href: string,
  context: LinkContext
): PreviewableLink | null {
  let url: URL;
  try {
    url = new URL(href, context.origin);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (WHATSAPP_HOSTS.has(url.hostname) || isFile(url)) return null;

  if (isInternal(url, context)) {
    const key = normalizeInternalPath(url.pathname);
    if (isQuietPath(key)) return null;
    if (
      context.currentPath !== undefined &&
      key === normalizeInternalPath(context.currentPath)
    ) {
      return null;
    }
    return { external: false, key };
  }

  const key = normalizeExternalUrl(url.href);
  return key ? { external: true, key } : null;
}
