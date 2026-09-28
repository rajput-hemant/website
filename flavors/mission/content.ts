import type { NavItem } from "@/content/site";

export type Section = NavItem & {
  /** The section number in the flight plan, printed as `3.0`. */
  n: number;
  /** What the page is in the flight plan. */
  job: string;
  /** `g` then this key jumps here. */
  key: string;
};

/**
 * The flight plan's sections, numbered like a standards manual: the crew
 * profile is 1.0, the missions 2.0, and so on. The header shows 2 to 5;
 * the rest are in the footer and ⌘K.
 */
export const sections = [
  { href: "/", label: "Home", n: 1, job: "Crew profile", key: "h" },
  { href: "/projects", label: "Projects", n: 2, job: "Missions", key: "p" },
  { href: "/work", label: "Experience", n: 3, job: "Trajectory", key: "e" },
  { href: "/lab", label: "Lab", n: 4, job: "Ground tests", key: "l" },
  { href: "/about", label: "About", n: 5, job: "Crew biography", key: "a" },
  { href: "/now", label: "Now", n: 6, job: "Status report", key: "n" },
  { href: "/ask", label: "Ask", n: 7, job: "Capcom", key: "q" },
  { href: "/resume", label: "Resume", n: 8, job: "Crew record", key: "r" },
] as const satisfies readonly Section[];

/** Primary navigation, in display order. */
export const nav = sections.slice(1, 5);

/** The section a path belongs to (`/projects/x` is 2.0), if any. */
export function sectionFor(pathname: string): Section | undefined {
  return sections.find(
    (entry) =>
      pathname === entry.href ||
      (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))
  );
}
