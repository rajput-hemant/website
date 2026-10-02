"use client";

import * as React from "react";
import { Stamp, type StampProps } from "@/flavors/drawing-set/components/ui";

import { belowFold, motionOn, observeOnce } from "@/lib/motion/entrance";

/**
 * The ANSWERED stamp presses into place (a small scale-down and twist onto its
 * resting tilt) the first time it scrolls into view. With motion off it only
 * fades in. No-op above the fold, same as `Reveal`.
 */
export function AnsweredStamp(props: StampProps) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !belowFold(el)) return;
    const moves = motionOn();
    el.style.opacity = "0";
    // The stamp rests at -2.5deg; the wrapper adds the extra twist.
    if (moves) el.style.transform = "scale(1.12) rotate(-3.5deg)";
    return observeOnce(el, () => {
      el.style.transition = moves
        ? "opacity 180ms var(--ease-flick), transform 180ms var(--ease-flick)"
        : "opacity 160ms linear";
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }, []);

  return (
    <span ref={ref} className="inline-block">
      <Stamp {...props} />
    </span>
  );
}
