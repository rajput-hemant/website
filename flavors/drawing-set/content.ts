import type { NavItem } from "@/content/site";

export type Sheet = NavItem & { sheet: string };

/** The drawing set index: every page is a numbered sheet. Pages read their `sheet` from here. */
export const sheets = [
  { href: "/", label: "Home", sheet: "00" },
  { href: "/projects", label: "Projects", sheet: "01" },
  { href: "/work", label: "Experience", sheet: "02" },
  { href: "/lab", label: "Lab", sheet: "03" },
  { href: "/about", label: "About", sheet: "04" },
  { href: "/now", label: "Now", sheet: "05" },
  { href: "/ask", label: "Ask", sheet: "06" },
  { href: "/resume", label: "Resume", sheet: "07" },
] as const satisfies readonly Sheet[];

export const sheetTotal = sheets.at(-1)!.sheet;

/** Sheet ledes that differ from the shared `content/site.ts` copy. */
export const pageLedes: Partial<Record<string, string>> = {
  "/now":
    "The current revision on sheet 05, plus the running log of changes to work, projects, this site, and the odd bit of life.",
};

export function pageLede(path: string, fallback: string): string {
  return pageLedes[path] ?? fallback;
}

/** Primary navigation (sheets 01 to 04), in display order. */
export const nav = sheets.slice(1, 5);

/** The sheet a path belongs to (`/projects/x` is on sheet 01), if any. */
export function sheetFor(pathname: string): Sheet | undefined {
  return sheets.find(
    (entry) =>
      pathname === entry.href ||
      (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))
  );
}
