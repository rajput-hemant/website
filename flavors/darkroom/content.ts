import type { NavItem } from "@/content/site";

export type Page = NavItem & {
  /** `g` then this key jumps to the page (the frame number on the header nav). */
  key: string;
  /** What the page is in the darkroom, set above its title. */
  job: string;
};

/**
 * The roll, page by page. The header prints the first four with their frame
 * numbers; the rest are reached from the footer and ⌘K.
 */
export const pages = [
  { href: "/", label: "Home", key: "h", job: "Contact print" },
  { href: "/projects", label: "Projects", key: "1", job: "Contact sheet" },
  { href: "/work", label: "Experience", key: "2", job: "Film roll" },
  { href: "/lab", label: "Lab", key: "3", job: "Test strips" },
  { href: "/about", label: "About", key: "4", job: "Enlargement" },
  { href: "/now", label: "Now", key: "5", job: "Drying line" },
  { href: "/ask", label: "Ask", key: "6", job: "Sleeves" },
  { href: "/resume", label: "Resume", key: "7", job: "Fibre print" },
] as const satisfies readonly Page[];

/** Primary navigation, in display order. */
export const nav = pages.slice(1, 5);

/** The footer's other pages. */
export const more = pages.slice(5);
