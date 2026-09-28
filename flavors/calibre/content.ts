import type { NavItem } from "@/content/site";

export type Page = NavItem & {
  /** `g` then this key jumps to the page. */
  key: string;
  /** What the page is in the movement, set above its title. */
  job: string;
  /**
   * The page's hour mark on the dial (XII Projects, III Experience, VI Lab,
   * IX About), or null for a page off the dial. Hovering a nav item steps
   * the rim index to it.
   */
  hour: number | null;
};

/**
 * The movement, page by page. The header prints the four with an hour mark;
 * the rest are reached from the footer and ⌘K.
 */
export const pages = [
  { href: "/", label: "Home", key: "h", job: "The movement", hour: null },
  {
    href: "/projects",
    label: "Projects",
    key: "1",
    job: "Jewel register",
    hour: 0,
  },
  {
    href: "/work",
    label: "Experience",
    key: "2",
    job: "Service record",
    hour: 3,
  },
  { href: "/lab", label: "Lab", key: "3", job: "Regulation bench", hour: 6 },
  { href: "/about", label: "About", key: "4", job: "Bench notes", hour: 9 },
  { href: "/now", label: "Now", key: "5", job: "Rate log", hour: null },
  {
    href: "/ask",
    label: "Ask",
    key: "6",
    job: "Engraving requests",
    hour: null,
  },
  {
    href: "/resume",
    label: "Resume",
    key: "7",
    job: "Certificate",
    hour: null,
  },
] as const satisfies readonly Page[];

type OnTheDial = (typeof pages)[number] & { hour: number };

/** Primary navigation, in display order: the pages with an hour mark. */
export const nav = pages.filter(
  (page): page is OnTheDial => page.hour !== null
);

/** The footer's other pages. */
export const more = pages.slice(5);
