"use client";

import * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";
import { CommandItem } from "cmdk";

import { highlightSegments } from "@/lib/command/highlight";

import { isAction, keywordsFor, type Item } from "./items";
import { goKeyFor } from "./shortcuts";

const kbd =
  "inline-flex min-w-5 items-center justify-center rounded-[4px] bg-plate-lo px-1.5 py-1 font-display text-[0.625rem] leading-none tracking-[0.08em] text-ink-2 uppercase shadow-[inset_0_1px_1px_rgb(0_0_0/0.2)]";

function Title({ text, search }: { text: string; search: string }) {
  if (!search.trim()) return text;
  return highlightSegments(text, search).map((segment, i) =>
    segment.match ? (
      <mark
        key={i}
        className="bg-transparent text-ink underline decoration-signal decoration-2 underline-offset-[0.2em]"
      >
        {segment.text}
      </mark>
    ) : (
      <span key={i}>{segment.text}</span>
    )
  );
}

/**
 * One option: a lamp (lit when selected, or when it's the active setting),
 * the title with query words underlined in signal yellow, a subtitle or date,
 * and its `g` shortcut.
 */
export function CommandRow({
  value,
  item,
  search,
  copied,
  onSelect,
}: {
  value: string;
  item: Item;
  search: string;
  copied: boolean;
  onSelect: () => void;
}) {
  const checked = copied || (isAction(item) && item.active === true);
  const goKey = isAction(item) ? undefined : goKeyFor(item.href);
  const subtitle = copied ? "Copied to the clipboard" : item.subtitle;
  // Dates read as a right-hand column; descriptions trail the title and truncate.
  const dated = item.group === "Work" || item.group === "Changelog";

  return (
    <CommandItem
      value={value}
      keywords={keywordsFor(item)}
      onSelect={onSelect}
      className="group/row flex min-h-10 cursor-default items-center gap-3 rounded-[6px] px-3 py-2 text-sm select-none data-[selected=true]:bg-plate-2 data-[selected=true]:shadow-[inset_0_1px_0_var(--color-hi),0_0_0_1px_var(--color-seam)]"
    >
      <span
        aria-hidden
        data-on={checked ? "" : undefined}
        className="led group-data-[selected=true]/row:bg-[color-mix(in_srgb,var(--color-signal)_50%,var(--color-led-off))] data-[on]:group-data-[selected=true]/row:bg-signal"
      />
      {checked && <span className="sr-only">(current) </span>}
      <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span
          className={cn(
            "truncate font-display text-[0.9375rem] tracking-[0.02em]",
            !dated && "max-w-full shrink-0"
          )}
        >
          <Title text={item.title} search={search} />
        </span>
        {subtitle && (
          <span
            className={cn(
              "text-ink-2",
              dated
                ? "ml-auto hidden shrink-0 pl-2 text-[0.75rem] whitespace-nowrap tabular-nums sm:inline"
                : "min-w-0 truncate",
              // Truncated descriptions are noise at phone width; "Copied" stays.
              !dated && !copied && "max-sm:hidden"
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
      {goKey && (
        <span aria-hidden className="hidden shrink-0 gap-1 fine:sm:flex">
          <kbd className={kbd}>g</kbd>
          <kbd className={kbd}>{goKey}</kbd>
        </span>
      )}
    </CommandItem>
  );
}

export { kbd as kbdClass };
