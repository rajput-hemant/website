import * as React from "react";
import { createStore } from "zustand/vanilla";

import type { SceneRoute } from "./poses";

/**
 * One thing a page lists that the scene draws, with its filter state: a
 * register row or a log entry. `match` is false when the page's own filter
 * hides it; `kind` is a plain tag the world may style by (a project status).
 */
export type PageEntry = {
  id: string;
  href: string | null;
  match: boolean;
  kind?: string | undefined;
};

type PageState = { route: SceneRoute | null; entries: readonly PageEntry[] };

/**
 * Page state the Drawing Set scene reads beyond the shared DOM contract
 * (`lib/scene/store.ts`), which carries only what is on screen. A filter
 * hides rows in the DOM, but the scene keeps drawing them sunk back into
 * their drawer, so it needs the full list and which ones pass.
 */
export const pageState = createStore<PageState>()(() => ({
  route: null,
  entries: [],
}));

/** The entries `route` published, or null when that page published none. */
export function entriesFor(route: SceneRoute): readonly PageEntry[] | null {
  const s = pageState.getState();
  return s.route === route ? s.entries : null;
}

/** Publishes a page's entries while it is mounted. */
export function usePageEntries(
  route: SceneRoute,
  entries: readonly PageEntry[]
) {
  React.useEffect(() => {
    pageState.setState({ route, entries });
    return () => {
      if (pageState.getState().route === route) {
        pageState.setState({ route: null, entries: [] });
      }
    };
  }, [route, entries]);
}
