import type { ReactElement } from "react";
import { ImageResponse } from "next/og";

import { site, sitePage, type SitePath } from "@/content/site";
import type { Image } from "@/lib/data/types";
import { absoluteUrl, displayUrl } from "@/lib/url";

import { getOgFonts } from "./fonts";
import { PageCard } from "./og-card";
import { ogSize } from "./theme";

/** `/work` → `localhost:3000/work`, as printed on a card. */
export function ogDisplayUrl(path = "/"): string {
  return displayUrl(absoluteUrl(path));
}

export async function renderOgImage(
  element: ReactElement,
  size: { width: number; height: number } = ogSize
): Promise<ImageResponse> {
  return new ImageResponse(element, { ...size, fonts: await getOgFonts() });
}

/**
 * The avatar as a data URL, fetched here so a failed download degrades to the
 * wordmark layout instead of failing the build.
 */
export async function loadAvatar(
  avatar: Image | null
): Promise<{ src: string; alt: string } | null> {
  if (!avatar) return null;
  try {
    const response = await fetch(avatar.url, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`${response.status}`);
    const type = response.headers.get("content-type") ?? "image/png";
    const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
    return { src: `data:${type};base64,${base64}`, alt: avatar.alt };
  } catch (error) {
    console.warn(
      `[og] Could not load the avatar (${error instanceof Error ? error.message : String(error)}); using the wordmark layout.`
    );
    return null;
  }
}

/** The standard card for a page in `content/site.ts` `pages`. */
export function renderPageOgImage(path: SitePath): Promise<ImageResponse> {
  const page = sitePage(path);
  return renderOgImage(
    <PageCard
      siteName={site.name}
      title={page.title}
      description={page.description}
      url={ogDisplayUrl(path)}
    />
  );
}
