"use client";

import { SceneGlyph } from "@/flavors/drawing-set/components/site/scene-glyph";
import { Button } from "@/flavors/drawing-set/components/ui";
import { Printer } from "lucide-react";

/** Opens the print dialog, where "Save as PDF" is the download. */
export function PrintButton() {
  return (
    <span
      data-glyph-host
      data-print="hide"
      className="inline-flex items-center gap-1"
    >
      <Button variant="ghost" size="sm" onClick={() => window.print()}>
        <Printer aria-hidden strokeWidth={1.75} />
        Print / Save as PDF
      </Button>
      {/* The plotter steps once on click, on the frame the dialog opens (U2). */}
      <SceneGlyph kind="plotter" slot="a" className="h-6 w-10" />
    </span>
  );
}
