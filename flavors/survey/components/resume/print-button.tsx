"use client";

import * as React from "react";
import type { Seal } from "@/flavors/survey/components/scene/glyphs/seal";
import {
  hostClass,
  posterClass,
} from "@/flavors/survey/components/scene/turn-pointer";
import { useGlyph } from "@/flavors/survey/components/scene/use-glyph";
import { Button } from "@/flavors/survey/components/ui/button";
import { playConfirm } from "@/flavors/survey/lib/sound/voices";
import { Printer } from "lucide-react";

/** The printed seal: a turned handle over its die, above the ring it leaves. */
function SealPoster({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={className}>
      <ellipse
        cx="20"
        cy="33"
        rx="10"
        ry="3"
        className="fill-none stroke-ink-faint"
      />
      <path
        d="M11 25h18v4.5H11Z"
        className="fill-contour stroke-ink"
        strokeWidth="0.8"
      />
      <path
        d="M17 25l1-4.5-1-7 -3.5-3.5 1-3.5h11l1 3.5-3.5 3.5-1 7 1 4.5Z"
        className="fill-sheet stroke-ink"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Opens the print dialog, where "Save as PDF" is the download. Beside it
 * (R2) the surveyor's seal presses onto the sheet while the button is held.
 */
export function PrintButton() {
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const hostRef = React.useRef<HTMLSpanElement>(null);
  const seal = useGlyph<Seal>(rootRef, hostRef, async () => {
    const { attachSeal } =
      await import("@/flavors/survey/components/scene/glyphs/seal");
    return attachSeal;
  });
  const press = (down: boolean) => seal.current?.press(down);

  return (
    <span data-print="hide" className="inline-flex items-center gap-1">
      <span
        ref={rootRef}
        aria-hidden
        data-glyph="seal"
        className="group relative size-10 shrink-0"
      >
        <SealPoster className={posterClass} />
        <span ref={hostRef} className={hostClass} />
      </span>
      <Button
        variant="ghost"
        size="sm"
        onPointerDown={() => press(true)}
        onPointerUp={() => press(false)}
        onPointerLeave={() => press(false)}
        onPointerCancel={() => press(false)}
        onClick={() => {
          // Rung before the dialog opens: print() blocks the page until it closes.
          playConfirm();
          window.print();
          press(false);
        }}
      >
        <Printer aria-hidden strokeWidth={1.75} />
        Print or save as PDF
      </Button>
    </span>
  );
}
