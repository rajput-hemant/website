import { pages } from "@/content/site";
import type { LiveFlavorId } from "@/flavors/registry";

const changelogPage = pages.find((page) => page.path === "/changelog");

/** Whether this edition serves `/changelog` instead of redirecting to the log on `/now`. */
export function flavorHasChangelogPage(flavor: LiveFlavorId): boolean {
  return changelogPage !== undefined && changelogPage.only === flavor;
}

/** Where a ⌘K changelog hit should land for a given year anchor. */
export function changelogUpdateHref(
  flavor: LiveFlavorId,
  year: string
): string {
  if (flavorHasChangelogPage(flavor)) return `/changelog#${year}`;
  return `/now#log-${year}`;
}
