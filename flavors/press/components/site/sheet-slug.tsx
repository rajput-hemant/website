"use client";

import { SHEET_COUNT, sheetFor } from "@/flavors/press/content";

import { usePublicPathname } from "@/lib/public-pathname";

/** "Sheet 2 of 8 / Projects": where this page sits in the set. */
export function SheetSlug() {
  const sheet = sheetFor(usePublicPathname());
  return sheet ? (
    <span>
      Sheet {sheet.n} of {SHEET_COUNT} &nbsp;/&nbsp; {sheet.label}
    </span>
  ) : (
    <span>Spoiled sheet &nbsp;/&nbsp; not in the set</span>
  );
}
