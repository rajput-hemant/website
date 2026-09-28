"use client";

import * as React from "react";
import { met } from "@/flavors/mission/lib/flight";

/**
 * The live MET clock: mission elapsed time since T-0. The server prints the
 * build's reading; the client takes over after hydration and ticks once a
 * second (text only, no frames).
 */
export function MetClock({
  launch,
  initial,
}: {
  /** T-0 in ms since the epoch. */
  launch: number;
  initial: string;
}) {
  const [value, setValue] = React.useState(initial);
  React.useEffect(() => {
    const tick = () => setValue(met(Date.now() - launch));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [launch]);
  return (
    <b role="timer" className="font-semibold text-ink tabular-nums">
      {value}
    </b>
  );
}
