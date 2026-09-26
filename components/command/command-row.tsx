"use client";

import * as React from "react";
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

import type { SearchEntry } from "@/lib/command/types";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui";

import { highlightSegments } from "./highlight";
import { isAction, keywordsFor, type Action, type Item } from "./items";
import { goKeyFor } from "./shortcuts";

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const groupIcons: Record<SearchEntry["group"], Icon> = {
  Pages: FileText,
  Projects: FolderGit2,
  Work: Briefcase,
  Log: History,
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
      <mark key={i} className="bg-transparent text-accent">
        {segment.text}
      </mark>
    ) : (
      <span key={i}>{segment.text}</span>
    )
  );
}

/** One option: icon, title (query words in the accent), subtitle or date, and its `g` shortcut. */
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
  const dated = item.group === "Work" || item.group === "Log";

  return (
    <CommandItem
      value={value}
      keywords={keywordsFor(item)}
      onSelect={onSelect}
      className="group/row relative flex min-h-10 cursor-default items-center gap-3 rounded-sm px-2.5 py-2 pl-4 text-sm select-none before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-0.5 before:scale-y-0 before:bg-accent data-[selected=true]:bg-sheet data-[selected=true]:before:scale-y-100 motion:before:transition-transform motion:before:duration-(--duration-ui) motion:before:ease-enter"
    >
      {React.createElement(icon, {
        "aria-hidden": true,
        strokeWidth: 1.75,
        className: cn(
          "size-4 shrink-0",
          checked
            ? "text-accent"
            : "text-ink-faint group-data-[selected=true]/row:text-ink"
        ),
      })}
      <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span
          className={cn(
            "truncate font-display font-medium tracking-[0.01em] uppercase [font-stretch:78%]",
            !dated && "max-w-full shrink-0"
          )}
        >
          <Title text={item.title} search={search} />
        </span>
        {subtitle && (
          <span
            className={cn(
              "text-ink-faint",
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
