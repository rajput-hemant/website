import { site } from "@/content/site";

/** `/work` → `https://…/work`; `/` is the bare site URL. */
export function absoluteUrl(path: string): string {
  return path === "/" ? site.url : `${site.url}${path}`;
}

/** A URL as a reader would type it: no protocol, no `www.`, no trailing slash. */
export function displayUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}
