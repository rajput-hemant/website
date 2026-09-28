"use client";

import * as React from "react";
import { Kbd } from "@/flavors/timetable/components/ui";
import { cn } from "@/flavors/timetable/lib/utils";
import { CommandItem } from "cmdk";
import {
  Briefcase,
  Check,
  FileText,
  FlaskConical,
  FolderGit2,
  History,
  Mail,
  MessageCircle,
  Monitor,
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
  Pages: FileText,
  Projects: FolderGit2,
  Work: Briefcase,
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
  "scene-auto": Monitor,
  "scene-low": Monitor,
  "scene-off": Monitor,
};

function Title({ text, search }: { text: string; search: string }) {
  if (!search.trim()) return text;
  return highlightSegments(text, search).map((segment, i) =>
    segment.match ? (
      <mark key={i} className="rounded-[2px] bg-signal/70 text-inherit">
        {segment.text}
      </mark>
    ) : (
      <span key={i}>{segment.text}</span>
    )
  );
}

/** One option: icon, title (query words marked in signal yellow), subtitle or date, and its `g` shortcut. */
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
      className="group/row relative flex min-h-11 cursor-default items-center gap-3 rounded-md px-2.5 py-2 pl-4 text-[0.9375rem] select-none before:absolute before:top-2 before:bottom-2 before:left-1 before:w-1 before:scale-y-0 before:rounded-full before:bg-ink data-[selected=true]:bg-ground data-[selected=true]:before:scale-y-100 motion:before:transition-transform motion:before:duration-(--duration-ui) motion:before:ease-enter"
    >
      {React.createElement(icon, {
        "aria-hidden": true,
        strokeWidth: 2,
        className: cn(
          "size-4 shrink-0",
          checked
            ? "text-ink"
            : "text-ink-soft group-data-[selected=true]/row:text-ink"
        ),
      })}
      <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span
          className={cn("truncate font-bold", !dated && "max-w-full shrink-0")}
        >
          <Title text={item.title} search={search} />
        </span>
        {subtitle && (
          <span
            className={cn(
              "text-ink-soft",
              dated
                ? "ml-auto hidden shrink-0 pl-2 font-mono text-mono-xs whitespace-nowrap tabular-nums sm:inline"
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
