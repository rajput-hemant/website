"use client";

import { Button } from "@/flavors/timetable/components/ui";
import { Printer } from "lucide-react";

/** Opens the print dialog, where "Save as PDF" is the download. */
export function PrintButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      data-print="hide"
      onClick={() => window.print()}
    >
      <Printer aria-hidden strokeWidth={2} className="size-4" />
      Print / Save as PDF
    </Button>
  );
}
