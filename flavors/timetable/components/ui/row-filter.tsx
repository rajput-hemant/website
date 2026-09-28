"use client";

import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";

export type RowFilterOption = { slug: string; label: string; count: number };

const readHash = (key: string) => {
  const prefix = `${key}=`;
  const raw = window.location.hash.replace(/^#/, "");
  return raw.startsWith(prefix)
    ? decodeURIComponent(raw.slice(prefix.length)) || null
    : null;
};

/**
 * Filters server-rendered rows inside `#boardId` by their `data-<key>`,
 * like the platform selector on a station board. Everything is in the DOM
 * without JS; this only hides rows, and the choice lives in `#<key>=<slug>`.
 */
export function RowFilter({
  boardId,
  filterKey,
  label,
  allLabel,
  options,
  className,
}: {
  boardId: string;
  /** The row attribute (`data-<filterKey>`) and the hash key. */
  filterKey: string;
  /** Accessible name of the group. */
  label: string;
  allLabel: string;
  options: RowFilterOption[];
  className?: string;
}) {
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
  const chip = (pressed: boolean) =>
    cn(
      "press inline-flex min-h-11 items-center gap-2 rounded-md px-3.5 pt-0.5 text-[0.9375rem] leading-none font-bold transition-colors duration-150",
      pressed
        ? "bg-ink text-ground"
        : "text-ink shadow-[inset_0_0_0_1.5px_var(--color-rule-strong)] fine:hover:bg-surface"
    );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap gap-2", className)}
    >
      <button
        type="button"
        aria-pressed={active === null}
        onClick={() => choose(null)}
        className={chip(active === null)}
      >
        {allLabel}
        <span className="font-mono text-mono-xs font-semibold opacity-70">
          {total}
        </span>
      </button>
      {options.map((option) => (
        <button
          key={option.slug}
          type="button"
          aria-pressed={active === option.slug}
          onClick={() => choose(active === option.slug ? null : option.slug)}
          className={chip(active === option.slug)}
        >
          {option.label}
          <span className="font-mono text-mono-xs font-semibold opacity-70">
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}
