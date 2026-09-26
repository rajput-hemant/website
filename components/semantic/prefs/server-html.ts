"use client";

import * as React from "react";

const subscribe = () => () => {};

/**
 * True when this component was hydrated from server HTML, false when React
 * created it on the client. The second happens when Next answers with its
 * error shell and renders the whole document in the browser, as it does for a
 * `notFound()` thrown at request time. Fixed at mount, so it never flips.
 */
export function useHydratedFromServer(): boolean {
  const hydrating = React.useSyncExternalStore(
    subscribe,
    () => false,
    () => true
  );
  const [fromServer] = React.useState(hydrating);
  return fromServer;
}
