/** A URL as a reader would type it: no protocol, no `www.`, no trailing slash. */
export function displayUrl(url: string) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}
