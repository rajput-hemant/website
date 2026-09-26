import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ogFonts } from "./theme";

type FontStyle = "normal" | "italic";
type FontWeight = 400 | 500;

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: FontStyle;
};

type FontSource = {
  name: string;
  /** A Google Fonts css2 `family` value pinned to one instance of every axis. */
  family: string;
  weight: FontWeight;
  style: FontStyle;
};

// Axis values match the site's CSS (the wordmark is opsz 72, SOFT 100, WONK 1).
// Pinning every axis makes Google serve a static TTF, which the renderer needs.
const SOURCES: readonly FontSource[] = [
  {
    name: ogFonts.serif,
    family: "Fraunces:opsz,wght,SOFT,WONK@72,500,100,1",
    weight: 500,
    style: "normal",
  },
  {
    name: ogFonts.serifItalic,
    family: "Fraunces:ital,opsz,wght,SOFT,WONK@1,72,400,100,1",
    weight: 400,
    style: "italic",
  },
  {
    name: ogFonts.sans,
    family: "Bricolage Grotesque:opsz,wght@24,400",
    weight: 400,
    style: "normal",
  },
  {
    name: ogFonts.mono,
    family: "Martian Mono:wdth,wght@87.5,400",
    weight: 400,
    style: "normal",
  },
];

const FETCH_TIMEOUT_MS = 8000;

async function fetchGoogleFont(family: string): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}`;
  // Without a browser user agent, Google answers with TrueType, not WOFF2.
  const css = await fetch(cssUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  }).then((response) => {
    if (!response.ok) throw new Error(`${response.status} for ${cssUrl}`);
    return response.text();
  });
  const fontUrl =
    /src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(css)?.[1];
  if (!fontUrl) throw new Error(`no TrueType source in ${cssUrl}`);

  const response = await fetch(fontUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${response.status} for ${fontUrl}`);
  return response.arrayBuffer();
}

/** Offline fallback: with one registered font, the renderer sets every face in it. */
async function bundledSerif(): Promise<OgFont[]> {
  const file = await readFile(
    join(process.cwd(), "components/og/fonts/fraunces-wordmark.ttf")
  );
  const data = file.buffer.slice(
    file.byteOffset,
    file.byteOffset + file.byteLength
  ) as ArrayBuffer;
  return [{ name: ogFonts.serif, data, weight: 500, style: "normal" }];
}

async function loadFonts(): Promise<OgFont[]> {
  try {
    return await Promise.all(
      SOURCES.map(async ({ family, ...font }) => ({
        ...font,
        data: await fetchGoogleFont(family),
      }))
    );
  } catch (error) {
    console.warn(
      `[og] Could not fetch fonts from Google Fonts (${error instanceof Error ? error.message : String(error)}); using the bundled Fraunces for every face.`
    );
    return bundledSerif();
  }
}

let fonts: Promise<OgFont[]> | undefined;

/** The OG fonts, fetched once per build worker and shared by every image. */
export function getOgFonts(): Promise<OgFont[]> {
  fonts ??= loadFonts();
  return fonts;
}
