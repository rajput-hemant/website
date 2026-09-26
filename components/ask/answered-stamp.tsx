"use client";

import * as React from "react";

import { Stamp, type StampProps } from "@/components/ui";
import { belowFold, motionOn, observeOnce } from "@/components/ui/entrance";

/**
 * The ANSWERED stamp presses into place (a quick scale-down pop) the first
 * time it scrolls into view. No-op above the fold or with motion off, same
 * as `Reveal`.
 */
export function AnsweredStamp(props: StampProps) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !motionOn() || !belowFold(el)) return;
    el.style.opacity = "0";
    el.style.transform = "scale(1.5)";
    return observeOnce(el, () => {
      el.style.transition =
        "opacity 200ms var(--ease-flick), transform 200ms var(--ease-flick)";
      el.style.opacity = "1";
      el.style.transform = "scale(1)";
    });
  }, []);

  return (
    <span ref={ref} className="inline-block">
      <Stamp {...props} />
    </span>
  );
}
