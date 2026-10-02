"use client";

import { SceneView } from "@/flavors/timetable/components/site/scene-view";
import { PrinterPoster } from "@/flavors/timetable/components/site/view-posters";
import { Button } from "@/flavors/timetable/components/ui";
import { Printer } from "lucide-react";

/**
 * Opens the print dialog, where "Save as PDF" is the download. The ticket
 * printer beside it feeds a ticket first: the dialog opens a frame later,
 * once that frame is drawn.
 */
export function PrintButton() {
  return (
    <span data-print="hide" className="inline-flex items-center gap-2">
      <SceneView
        id="printer"
        poster={<PrinterPoster />}
        className="h-11 w-14"
      />
      <Button
        variant="ghost"
        size="sm"
        data-printer
        onClick={() =>
          requestAnimationFrame(() => requestAnimationFrame(() => print()))
        }
      >
        <Printer aria-hidden strokeWidth={2} className="size-4" />
        Print / Save as PDF
      </Button>
    </span>
  );
}
