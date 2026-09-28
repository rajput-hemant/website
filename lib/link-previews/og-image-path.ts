function djb2(text: string): number {
  let hash = 5381;
  for (let index = 0; index < text.length; index++) {
    hash = ((hash << 5) + hash + text.charCodeAt(index)) & 0xffffffff;
  }
  return hash >>> 0;
}

/**
 * The URL Next serves a generated `opengraph-image` at. Inside a route group
 * Next appends a short hash of the file's directory (`/ask/opengraph-image-5jkhl4`)
 * so grouped routes can't collide; this mirrors `getMetadataRouteSuffix` in
 * next/dist/lib/metadata/get-metadata-route.js, which Next does not export.
 *
 * @param segmentDir The image file's directory under `app/`, e.g. `/(site)/ask/[slug]`.
 * @param pathname The public path of that directory, e.g. `/ask/some-thread`.
 */
export function generatedOgImagePath(
  segmentDir: string,
  pathname: string
): string {
  const grouped = segmentDir
    .split("/")
    .some((segment) => /^\(.+\)$/.test(segment) || segment.startsWith("@"));
  const suffix = grouped ? `-${djb2(segmentDir).toString(36).slice(0, 6)}` : "";
  const base = pathname === "/" ? "" : pathname.replace(/\/$/, "");
  return `${base}/opengraph-image${suffix}`;
}
