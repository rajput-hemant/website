"use client";

import * as React from "react";

import { formatTenure } from "@/lib/format";

const subscribeNever = () => () => {};

/**
 * A role's length. An ongoing role is measured to the visitor's today, not
 * the build's, once hydrated; the server renders the build-time figure.
 */
export function LiveTenure({
  start,
  end,
  built,
}: {
  start: string;
  end?: string;
  built: string;
}) {
  const live = React.useSyncExternalStore(
    subscribeNever,
    () => (end ? built : formatTenure(start, new Date())),
    () => built
  );
  return <>{live}</>;
}
