import { site } from "@/content/site";

import type { Link, Profile } from "./types";

/**
 * Who the site is about, as every page, card and mark names them. Built from
 * the profile in the data layer; each field falls back to `content/site.ts`
 * only when the profile has nothing to derive it from, so pointing the site
 * at another person's data renames everything at once.
 */
export type SiteIdentity = {
  /** Full display name: `Ada Lovelace`. */
  name: string;
  /** First word of the name: `Ada`. */
  firstName: string;
  /** Lowercase first name, for wordmarks and particle words: `ada`. */
  shortName: string;
  /** URL-safe handle: the GitHub or LinkedIn username, else a slug of the name. */
  handle: string;
  /** Uppercase initials of the first and last word: `AL`. One word gives one letter. */
  initials: string;
  /** One-line description: the profile headline. */
  description: string;
  /** Canonical origin, no trailing slash (static config, not identity data). */
  url: string;
  locale: string;
};

export type IdentitySource = Pick<Profile, "name" | "headline" | "links">;

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function firstGrapheme(word: string): string {
  for (const { segment } of segmenter.segment(word)) return segment;
  return "";
}

function words(name: string): string[] {
  return name.split(/\s+/).filter(Boolean);
}

/** `José Núñez` -> `jose-nunez`; scripts without case or accents pass through. */
export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/(\p{Script=Latin})\p{M}+/gu, "$1")
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function initialsOf(name: string): string {
  const parts = words(name);
  const first = parts[0];
  if (!first) return "";
  const last = parts.length > 1 ? parts[parts.length - 1] : undefined;
  return (
    firstGrapheme(first) + (last ? firstGrapheme(last) : "")
  ).toLocaleUpperCase();
}

const HANDLE_HOSTS: readonly { host: RegExp; path: RegExp }[] = [
  { host: /(^|\.)github\.com$/i, path: /^\/([A-Za-z0-9-]+)\/?$/ },
  { host: /(^|\.)linkedin\.com$/i, path: /^\/in\/([^/]+)\/?$/ },
];

/** The username in a GitHub or LinkedIn profile link, GitHub first. */
export function handleFromLinks(links: readonly Link[]): string | undefined {
  for (const { host, path } of HANDLE_HOSTS) {
    for (const link of links) {
      let url: URL;
      try {
        url = new URL(link.url);
      } catch {
        continue;
      }
      if (!host.test(url.hostname)) continue;
      const match = path.exec(url.pathname)?.[1];
      if (match) return decodeURIComponent(match).toLowerCase();
    }
  }
  return undefined;
}

/**
 * The identity for a profile. A blank profile name falls back to the
 * configured one, and every name-derived field follows the resolved name.
 */
export function deriveSiteIdentity(profile: IdentitySource): SiteIdentity {
  const profileName = words(profile.name).join(" ");
  const name = profileName || site.name;
  const firstName = words(name)[0] ?? name;
  return {
    name,
    firstName,
    shortName: profileName ? firstName.toLocaleLowerCase() : site.shortName,
    handle:
      handleFromLinks(profile.links) ??
      (profileName ? slugifyName(profileName) : site.handle),
    initials: initialsOf(name),
    description: profile.headline.trim() || site.description,
    url: site.url,
    locale: site.locale,
  };
}

/**
 * Swaps the configured name and short name in a fallback string (a page
 * description in `content/site.ts`, a lab label) for the resolved ones, so
 * static copy written about the configured owner reads right for anyone.
 */
export function personalize(text: string, identity: SiteIdentity): string {
  if (identity.name === site.name && identity.shortName === site.shortName) {
    return text;
  }
  return text
    .replaceAll(site.name, identity.name)
    .replaceAll(site.shortName, identity.shortName);
}
