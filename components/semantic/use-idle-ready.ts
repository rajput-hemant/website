"use client";

import * as React from "react";

/** False until the browser is first idle after hydration (or `timeout` ms). */
export function useIdleReady(timeout = 2000): boolean {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const start = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 300);
    return () => clearTimeout(id);
  }, [timeout]);

  return ready;
}
