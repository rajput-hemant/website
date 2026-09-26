"use client";

import * as React from "react";

import type { IsoDate } from "@/lib/data/types";
import { formatTenure } from "@/lib/format";

const subscribe = () => () => {};

/**
 * How long an ongoing role has run, measured to the visitor's clock. The page
 * is static, so the server snapshot is the build-time label: nothing is blank
 * before hydration, and the text changes only if a month has turned since.
 */
export function OngoingTenure({
  start,
  buildLabel,
}: {
  start: IsoDate;
  buildLabel: string;
}) {
  return React.useSyncExternalStore(
    subscribe,
    () => formatTenure(start, new Date()),
    () => buildLabel
  );
}
