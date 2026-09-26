"use client";

import { Button } from "@/flavors/press/components/ui/button";
import { Printer } from "lucide-react";

/** Opens the print dialog, where "Save as PDF" is the download. */
export function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer aria-hidden strokeWidth={1.75} />
      Print / Save as PDF
    </Button>
  );
}
