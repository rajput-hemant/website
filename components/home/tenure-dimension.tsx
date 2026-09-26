"use client";

import * as React from "react";

import type { IsoDate } from "@/lib/data/types";
import { formatTenure } from "@/lib/dates";
import { Dimension } from "@/components/ui";

const subscribe = () => () => {};

/**
 * A role's length as a vertical dimension. An ongoing role is measured to the
 * visitor's clock after hydration; the static build label renders first.
 */
export function TenureDimension({
  start,
  end,
  buildLabel,
  className,
}: {
  start: IsoDate;
  end?: IsoDate;
  buildLabel: string;
  className?: string;
}) {
  const label = React.useSyncExternalStore(
    subscribe,
    () => (end ? buildLabel : formatTenure(start)),
    () => buildLabel
  );
  return <Dimension orientation="v" label={label} className={className} />;
}
