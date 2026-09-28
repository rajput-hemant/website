import type { NavItem } from "@/content/site";

export type Page = NavItem & {
  /** `g` then this key jumps to the page. */
  key: string;
  /** What the page is in the model room, set above its title. */
  job: string;
};

/**
 * The model room, page by page. The header lists the first four; the rest
 * are reached from the footer and ⌘K.
 */
export const pages = [
  { href: "/", label: "Home", key: "h", job: "Site model" },
  { href: "/projects", label: "Projects", key: "1", job: "Vitrines" },
  { href: "/work", label: "Experience", key: "2", job: "Phasing plan" },
  { href: "/lab", label: "Lab", key: "3", job: "Test massing" },
  { href: "/about", label: "About", key: "4", job: "Wall label" },
  { href: "/now", label: "Now", key: "5", job: "Revisions" },
  { href: "/ask", label: "Ask", key: "6", job: "Comment cards" },
  { href: "/resume", label: "Resume", key: "7", job: "Spec sheet" },
] as const satisfies readonly Page[];

/** Primary navigation, in display order. */
export const nav = pages.slice(1, 5);

/** The footer's other pages. */
export const more = pages.slice(5);
