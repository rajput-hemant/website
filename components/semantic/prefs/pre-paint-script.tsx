"use client";

import { useHydratedFromServer } from "./server-html";

/**
 * An inline script that only exists in server HTML, where it runs before
 * first paint. A script React creates on the client never runs (and React
 * warns about it), so a client-rendered document gets nothing here and
 * `PrefsSync` applies preferences on mount instead.
 */
export function PrePaintScript({ html }: { html: string }) {
  const fromServer = useHydratedFromServer();
  return fromServer ? (
    <script dangerouslySetInnerHTML={{ __html: html }} />
  ) : null;
}
