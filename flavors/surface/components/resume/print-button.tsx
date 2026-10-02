"use client";

import * as React from "react";
import { PaperRoll } from "@/flavors/surface/components/instruments/roll";

/** Millimetres of paper a hover feeds, and a press (which then prints). */
const NUDGE = 1;
const FEED = 20;
/** The feed takes this long before the print dialog opens. */
const FEED_MS = 300;

/**
 * Opens the print dialog, where "Save as PDF" is the download. The thermal
 * roll beside it feeds a nudge on hover and a curl on press, then prints.
 */
export function PrintButton() {
  const [feed, setFeed] = React.useState(0);
  const timer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span data-print="hide" className="inline-flex items-center gap-3">
      <PaperRoll feed={feed} />
      <button
        type="button"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse")
            setFeed((mm) => (mm < FEED ? mm + NUDGE : mm));
        }}
        onClick={() => {
          setFeed(FEED);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => {
            window.print();
            setFeed(0);
          }, FEED_MS);
        }}
        className="key key-sm"
      >
        Print or save as PDF
      </button>
    </span>
  );
}
