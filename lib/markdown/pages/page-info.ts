import { pages } from "@/content/site";

export type MirroredPath = (typeof pages)[number]["path"];

export function pageInfo(path: MirroredPath) {
  const page = pages.find((entry) => entry.path === path);
  if (!page)
    throw new Error(`[markdown] ${path} is not in content/site.ts pages`);
  return page;
}
