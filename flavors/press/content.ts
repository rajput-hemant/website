import type { NavItem } from "@/content/site";

export type Sheet = NavItem & {
  /** The sheet's number in the set, printed in the slug line and used by `g` jumps. */
  n: number;
  /** What this sheet is in print terms, set under the title in slugs. */
  job: string;
};

/**
 * The job, sheet by sheet: every page is one sheet of the run. The header
 * nav is sheets 2 to 5; the rest are reached from the footer and ⌘K.
 */
export const sheets = [
  { href: "/", label: "Home", n: 1, job: "Title sheet" },
  { href: "/projects", label: "Projects", n: 2, job: "Signatures" },
  { href: "/work", label: "Experience", n: 3, job: "Press log" },
  { href: "/lab", label: "Lab", n: 4, job: "Test sheets" },
  { href: "/about", label: "About", n: 5, job: "Colophon" },
  { href: "/now", label: "Now", n: 6, job: "Latest proof" },
  { href: "/ask", label: "Ask", n: 7, job: "Corrections sheet" },
  { href: "/resume", label: "Resume", n: 8, job: "Final print" },
] as const satisfies readonly Sheet[];

export const SHEET_COUNT = sheets.length;

/** Primary navigation, in display order. */
export const nav = sheets.slice(1, 5);

/** The sheet a path belongs to (`/projects/x` is sheet 2), if any. */
export function sheetFor(pathname: string): Sheet | undefined {
  return sheets.find(
    (entry) =>
      pathname === entry.href ||
      (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))
  );
}
