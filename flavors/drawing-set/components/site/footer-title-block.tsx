"use client";

import * as React from "react";
// Direct path: a client import of the barrel would pull every UI module into this chunk.
import {
  TitleBlock,
  type TitleBlockRow,
} from "@/flavors/drawing-set/components/ui/title-block";
import { sheetFor, sheetTotal } from "@/flavors/drawing-set/content";

import { usePublicPathname } from "@/lib/public-pathname";

/**
 * The page-end title block. The sheet number follows the route; its rules
 * plot on the session's first load (`data-plot`) and re-plot on every client
 * navigation after that.
 */
export function FooterTitleBlock({
  rows,
  rev,
}: {
  rows: TitleBlockRow[];
  rev: string;
}) {
  const pathname = usePublicPathname();
  const [visit, setVisit] = React.useState({ pathname, count: 0 });
  if (visit.pathname !== pathname) {
    setVisit({ pathname, count: visit.count + 1 });
  }

  return (
    <div
      key={visit.count}
      data-replot={visit.count > 0 || undefined}
      className="relative w-full md:w-auto"
    >
      <span
        aria-hidden
        className="plot-x absolute inset-x-0 -top-4 h-px origin-right bg-line-strong"
        style={{ "--plot-delay": "500ms" } as React.CSSProperties}
      />
      <TitleBlock
        rows={rows}
        sheet={sheetFor(pathname)?.sheet ?? "--"}
        total={sheetTotal}
        rev={rev}
        className="w-full md:w-auto"
      />
    </div>
  );
}
