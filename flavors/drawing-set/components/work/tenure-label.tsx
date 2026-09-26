"use client";

import * as React from "react";
import {
  tenure,
  tenureMonths,
  type Tenure,
} from "@/flavors/drawing-set/lib/dates";
import { useMotionOn } from "@/flavors/drawing-set/lib/motion/use-root-data";
import NumberFlow from "@number-flow/react";

import type { IsoDate } from "@/lib/data/types";

const subscribe = () => () => {};

function toParts(totalMonths: number): Tenure {
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
}

export type TenureLabelProps = {
  start: IsoDate;
  /** Absent means the role is ongoing. */
  end?: IsoDate;
  /** The server's snapshot, computed against its own clock at render time. */
  buildTenure: Tenure;
};

/**
 * A role's duration, counted up from zero once on mount, then left alone.
 * `useSyncExternalStore`'s snapshot must be a primitive (a fresh object every
 * call trips its "should be cached" check), so it tracks total months as a
 * number and only converts back to years/months for display. Ended roles are
 * exact either side of hydration; an ongoing role's server snapshot is
 * `buildTenure` (build time), and the client remeasures against the
 * visitor's own clock.
 */
export function TenureLabel({ start, end, buildTenure }: TenureLabelProps) {
  const motion = useMotionOn();
  const totalMonths = React.useSyncExternalStore(
    subscribe,
    () => tenureMonths(tenure(start, end ?? new Date())),
    () => tenureMonths(buildTenure)
  );
  const target = toParts(totalMonths);
  const [animated, setAnimated] = React.useState<Tenure>({
    years: 0,
    months: 0,
  });

  React.useEffect(() => {
    if (!motion) return;
    const frame = requestAnimationFrame(() =>
      setAnimated(toParts(totalMonths))
    );
    return () => cancelAnimationFrame(frame);
  }, [motion, totalMonths]);

  const shown = motion ? animated : target;

  return (
    <span className="tabular-nums">
      {target.years > 0 && (
        <>
          <NumberFlow value={shown.years} animated={motion} />Y{" "}
        </>
      )}
      <NumberFlow value={shown.months} animated={motion} />M
    </span>
  );
}
