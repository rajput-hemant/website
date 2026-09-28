"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const DeferredLayers = dynamic(
  () => import("./deferred-layers").then((mod) => mod.DeferredLayers),
  { ssr: false }
);

/** Mounts the motion and pointer stack once the browser is idle after hydration, so none of it is in the initial chunks. */
export function DeferredShell() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const start = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 300);
    return () => clearTimeout(id);
  }, []);

  return ready ? <DeferredLayers /> : null;
}
