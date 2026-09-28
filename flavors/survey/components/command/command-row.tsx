"use client";

import * as React from "react";
import { Kbd } from "@/flavors/survey/components/ui/kbd";
import { cn } from "@/flavors/survey/lib/utils";
import { CommandItem } from "cmdk";
import {
  Check,
  FileText,
  FlaskConical,
  History,
  Mail,
  Map as MapIcon,
  MessageCircle,
  Mountain,
  NotebookPen,
  Route,
  SunMoon,
  Volume2,
  Wand2,
} from "lucide-react";

import { highlightSegments } from "@/lib/command/highlight";
import type { SearchEntry } from "@/lib/command/types";

import { isAction, keywordsFor, type Action, type Item } from "./items";
import { goKeyFor } from "./shortcuts";

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const groupIcons: Record<SearchEntry["group"], Icon> = {
  Pages: MapIcon,
  Projects: NotebookPen,
  Work: Route,
  Changelog: History,
  Lab: FlaskConical,
  Ask: MessageCircle,
};

const actionIcons: Record<Action, Icon> = {
  "copy-email": Mail,
  resume: FileText,
  "toggle-theme": SunMoon,
  "toggle-motion": Wand2,
  "toggle-sound": Volume2,
  "scene-auto": Mountain,
  "scene-low": Mountain,
  "scene-off": Mountain,
};

function Title({ text, search }: { text: string; search: string }) {
  if (!search.trim()) return text;
  return highlightSegments(text, search).map((segment, i) =>
    segment.match ? (
      <mark key={i} className="rounded-sm bg-water/20 text-inherit">
        {segment.text}
      </mark>
    ) : (
      <span key={i}>{segment.text}</span>
    )
  );
}

/** One option: icon, title (query words marked in water blue), subtitle or date, and its `g` shortcut. */
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
  const icon = checked
    ? Check
    : isAction(item)
      ? actionIcons[item.action]
      : groupIcons[item.group];
  const goKey = isAction(item) ? undefined : goKeyFor(item.href);
  const subtitle = copied ? "Copied to the clipboard" : item.subtitle;
  // Dates read as a right-hand column; descriptions trail the title and truncate.
  const dated = item.group === "Work" || item.group === "Changelog";

  return (
    <CommandItem
      value={value}
      keywords={keywordsFor(item)}
      onSelect={onSelect}
      className="group/row relative flex min-h-11 cursor-default items-center gap-3 px-3 py-2 text-sm select-none before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:scale-y-0 before:bg-water data-[selected=true]:bg-highlight data-[selected=true]:before:scale-y-100 motion:before:transition-transform motion:before:duration-(--duration-ui) motion:before:ease-enter"
    >
      {React.createElement(icon, {
        "aria-hidden": true,
        strokeWidth: 1.75,
        className: cn(
          "size-4 shrink-0",
          checked
            ? "text-wood"
            : "text-ink-faint group-data-[selected=true]/row:text-water"
        ),
      })}
      <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span
          className={cn(
            "truncate font-medium text-ink",
            !dated && "max-w-full shrink-0"
          )}
        >
          <Title text={item.title} search={search} />
        </span>
        {subtitle && (
          <span
            className={cn(
              "text-ink-soft",
              dated
                ? "caps ml-auto hidden shrink-0 pl-2 whitespace-nowrap tabular-nums sm:inline"
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
          <Kbd>g</Kbd>
          <Kbd>{goKey}</Kbd>
        </span>
      )}
    </CommandItem>
  );
}
