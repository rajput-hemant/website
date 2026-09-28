"use client";

import { Button } from "@/flavors/survey/components/ui/button";
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
      <Printer aria-hidden strokeWidth={1.75} />
      Print or save as PDF
    </Button>
  );
}
