"use client";

import * as React from "react";

export type RowFilterOption = { slug: string; label: string; count: number };

const readHash = (key: string) => {
  const prefix = `${key}=`;
  const raw = window.location.hash.replace(/^#/, "");
  return raw.startsWith(prefix)
    ? decodeURIComponent(raw.slice(prefix.length)) || null
    : null;
};

/**
 * Filters server-rendered rows inside `#boardId` by their `data-<key>`.
 * Everything is in the DOM without JS; this only hides rows, keeps a
 * `[data-board-count]` in step, hides `[data-filter-group]`s left empty, and
 * keeps the choice in `#<key>=<slug>`. The edition renders the controls.
 */
export function useRowFilter(
  boardId: string,
  filterKey: string,
  options: readonly RowFilterOption[]
) {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    const sync = () => {
      const slug = readHash(filterKey);
      setActive(options.some((o) => o.slug === slug) ? slug : null);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [options, filterKey]);

  React.useEffect(() => {
    const board = document.getElementById(boardId);
    if (!board) return;
    let shown = 0;
    for (const row of board.querySelectorAll<HTMLElement>(
      `[data-${filterKey}]`
    )) {
      const match = !active || row.getAttribute(`data-${filterKey}`) === active;
      row.hidden = !match;
      if (match) shown++;
    }
    const count = board.querySelector("[data-board-count]");
    if (count) count.textContent = String(shown);
    for (const group of board.querySelectorAll<HTMLElement>(
      "[data-filter-group]"
    )) {
      group.hidden = !group.querySelector(`[data-${filterKey}]:not([hidden])`);
    }
  }, [active, boardId, filterKey]);

  const choose = (slug: string | null) => {
    setActive(slug);
    const url = new URL(window.location.href);
    url.hash = slug ? `${filterKey}=${encodeURIComponent(slug)}` : "";
    history.replaceState(history.state, "", url);
  };

  const total = options.reduce((sum, o) => sum + o.count, 0);
  return { active, choose, total };
}
