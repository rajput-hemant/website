"use client";

import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

export type AnimatedCountProps = {
  /** Shown on the first frame: the last count this browser saw, or 0. */
  from: number;
  to: number;
  /** The site's motion preference; NumberFlow itself honours reduced motion. */
  animated: boolean;
};

/**
 * Loaded on demand by `VisitorCounter`, so NumberFlow stays out of the shared
 * bundle. Mounts at `from` and moves to `to` on the next frame, which is what
 * makes the digits roll on first reveal.
 */
export function AnimatedCount({ from, to, animated }: AnimatedCountProps) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setValue(to));
    return () => cancelAnimationFrame(frame);
  }, [to]);

  return (
    <NumberFlow
      value={value}
      locales="en-US"
      format={{ notation: "standard" }}
      animated={animated}
      willChange
    />
  );
}
