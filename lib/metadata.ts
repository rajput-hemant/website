import type { Metadata } from "next";

import { getSiteIdentity } from "@/lib/data";
import { personalize, type SiteIdentity } from "@/lib/data/identity";
import { ogSize } from "@/components/og/theme";

const TITLE_SEPARATOR = " · ";

/** The root layout's title template; `pageMetadata` builds social titles the same way. */
export function titleTemplate(site: SiteIdentity): string {
  return `%s${TITLE_SEPARATOR}${site.name}`;
}

/** Open Graph fields every page shares. A page's `openGraph` replaces its parent's, so each spreads these in. */
export function baseOpenGraph(site: SiteIdentity) {
  return {
    siteName: site.name,
    type: "website",
    locale: site.locale,
  } as const satisfies Metadata["openGraph"];
}

export const twitterCard = "summary_large_image";

/** Alt text for the site-wide card rendered by app/opengraph-image.tsx. */
export function siteCardAlt(site: SiteIdentity): string {
  return `${site.name}: ${site.description}`;
}

/**
 * The site-wide card. A page that sets `openGraph` without `images` loses the
 * card inherited from app/opengraph-image.tsx, so it is named explicitly.
 */
function siteCard(site: SiteIdentity) {
  return {
    url: "/opengraph-image",
    type: "image/png",
    alt: siteCardAlt(site),
    ...ogSize,
  };
}

export type PageMetadataInput = {
  /** Short page title, templated into "Title · Site". Omit for the home page. */
  title?: string;
  description: string;
  /** Canonical path, e.g. `/work`. */
  path: string;
  /** Open Graph object type; `article` suits a single entry such as an /ask permalink. */
  type?: "website" | "article";
  /**
   * Set `false` when the route segment has its own `opengraph-image` file:
   * naming an image here would override that file.
   */
  siteImage?: boolean;
};

/**
 * Title, description, canonical URL, Open Graph and Twitter card for one
 * page, named for the resolved site identity.
 */
export async function pageMetadata({
  title,
  description: fallbackDescription,
  path,
  type = "website",
  siteImage = true,
}: PageMetadataInput): Promise<Metadata> {
  const site = await getSiteIdentity();
  const description = personalize(fallbackDescription, site);
  const socialTitle = title
    ? titleTemplate(site).replace("%s", title)
    : site.name;

  return {
    title: title ?? { absolute: site.name },
    description,
    alternates: { canonical: path },
    openGraph: {
      ...baseOpenGraph(site),
      type,
      url: path,
      title: socialTitle,
      description,
      ...(siteImage && { images: [siteCard(site)] }),
    },
    // Twitter images are filled in from `openGraph.images`.
    twitter: { card: twitterCard, title: socialTitle, description },
  };
}
