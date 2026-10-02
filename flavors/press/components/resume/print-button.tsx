"use client";

import { Button } from "@/flavors/press/components/ui/button";
import { ITEM, VIEW_EVENT } from "@/flavors/press/lib/scene/views";
import { Printer } from "lucide-react";

/** How long the guillotine takes to fall before the dialog opens. */
const DROP_MS = 80;

/**
 * Opens the print dialog, where "Save as PDF" is the download. The blade
 * beside it falls first (80ms) when motion is on.
 */
export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      data-scene-item={ITEM.print}
      onClick={() => {
        // The root's motion flag (not the scene clock, which would pull gsap in).
        if (document.documentElement.dataset.motion !== "on")
          return window.print();
        dispatchEvent(new Event(VIEW_EVENT.print));
        setTimeout(() => window.print(), DROP_MS);
      }}
    >
      <Printer aria-hidden strokeWidth={1.75} />
      Print / Save as PDF
    </Button>
  );
}
