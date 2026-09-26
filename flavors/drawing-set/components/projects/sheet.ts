import { sheets } from "@/flavors/drawing-set/content";

/** A page's number in the set, e.g. "01" for /projects. */
export function sheetOf(href: string): string {
  return sheets.find((entry) => entry.href === href)?.sheet ?? "";
}

/** The last sheet number, for "00 / 07". */
export const lastSheet: string = sheets.at(-1)?.sheet ?? "";

/** A changelog date as a revision stamp: "2026-09-12" -> "26.09". */
export function revOf(date: string | undefined): string {
  return date ? `${date.slice(2, 4)}.${date.slice(5, 7)}` : "";
}
