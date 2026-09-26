import type { NavItem } from "@/content/site";

export type Place = NavItem & {
  /** The `g` shortcut's second key. */
  key: string;
  /** What this page is on the survey sheet. */
  sheet: string;
};

/**
 * Every page as a part of the survey: the header nav is Projects to About;
 * the rest are reached from the footer and ⌘K.
 */
export const places = [
  { href: "/", label: "Home", key: "h", sheet: "The sheet" },
  { href: "/projects", label: "Projects", key: "p", sheet: "Gazetteer" },
  { href: "/work", label: "Experience", key: "e", sheet: "Transects" },
  { href: "/lab", label: "Lab", key: "l", sheet: "Field trials" },
  { href: "/about", label: "About", key: "a", sheet: "Survey history" },
  { href: "/now", label: "Now", key: "n", sheet: "Revision notes" },
  { href: "/ask", label: "Ask", key: "k", sheet: "Field notebook" },
  { href: "/resume", label: "Resume", key: "r", sheet: "Printed sheet" },
] as const satisfies readonly Place[];

/** Primary navigation, in display order. */
export const nav = places.slice(1, 5);
