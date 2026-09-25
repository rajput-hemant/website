import type { ReactElement } from "react";
import { ImageResponse } from "next/og";

import { pages, site } from "@/content/site";
import type { Image } from "@/lib/data/types";

import { getOgFonts } from "./fonts";
import { PageCard } from "./og-card";
import { ogSize } from "./theme";

/** `http://localhost:3000` + `/work` → `localhost:3000/work`. */
export function ogDisplayUrl(path = "/"): string {
  const host = site.url.replace(/^https?:\/\//, "");
  return path === "/" ? host : `${host}${path}`;
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

type PagePath = (typeof pages)[number]["path"];

/** The standard card for a page in `content/site.ts` `pages`. */
export function renderPageOgImage(path: PagePath): Promise<ImageResponse> {
  const page = pages.find((entry) => entry.path === path);
  return renderOgImage(
    <PageCard
      siteName={site.name}
      title={page?.title ?? site.name}
      description={page?.description ?? site.description}
      url={ogDisplayUrl(path)}
    />
  );
}
