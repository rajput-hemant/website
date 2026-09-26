/** What a hover card shows for one link. Every field is optional: a failed fetch leaves a text-only entry. */
export type LinkPreview = {
  title?: string;
  description?: string;
  /** Absolute http(s) URL, or a same-origin path for the site's own cards. */
  image?: string;
  siteName?: string;
};

/**
 * Served at `/link-previews.json`. Keys are internal paths (`/work`) or
 * normalised absolute URLs (see `normalizeExternalUrl`).
 */
export type LinkPreviewMap = Record<string, LinkPreview>;
