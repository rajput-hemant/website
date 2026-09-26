"use client";

import * as React from "react";
import NumberFlow from "@number-flow/react";

/** Loaded on demand, so NumberFlow stays out of the shared bundle. Rolls from `from` to `to`. */
export function AnimatedCount({
  from,
  to,
  animated,
}: {
  from: number;
  to: number;
  animated: boolean;
}) {
  const [value, setValue] = React.useState(from);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setValue(to));
    return () => cancelAnimationFrame(frame);
  }, [to]);
  return (
    <NumberFlow
      value={value}
      locales="en-US"
      format={{ notation: "standard", minimumIntegerDigits: 6 }}
      animated={animated}
      willChange
    />
  );
}
