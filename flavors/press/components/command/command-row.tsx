"use client";

import * as React from "react";
import { Kbd } from "@/flavors/press/components/ui/kbd";
import { cn } from "@/flavors/press/lib/utils";
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
import { isAction, keywordsFor, type Item } from "@/lib/command/items";
import type { StandardAction } from "@/lib/command/standard-actions";
import type { SearchEntry } from "@/lib/command/types";

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

const actionIcons: Record<StandardAction, Icon> = {
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
      <mark key={i}>{segment.text}</mark>
    ) : (
      <span key={i}>{segment.text}</span>
    )
  );
}

/** One option: icon, title (query words marked in P3 yellow), subtitle, and its `g` shortcut. */
export function CommandRow({
  value,
  item,
  search,
  copied,
  onSelect,
}: {
  value: string;
  item: Item<StandardAction>;
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
  const dated = item.group === "Work" || item.group === "Changelog";

  return (
    <CommandItem
      value={value}
      keywords={keywordsFor(item)}
      onSelect={onSelect}
      className="group/row relative flex min-h-11 cursor-default items-center gap-3 px-3 py-2 text-sm select-none data-[selected=true]:bg-paper data-[selected=true]:shadow-[inset_3px_0_0_var(--color-pink)]"
    >
      {React.createElement(icon, {
        "aria-hidden": true,
        strokeWidth: 1.75,
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
                ? "ml-auto hidden shrink-0 pl-2 slug whitespace-nowrap sm:inline"
                : "min-w-0 truncate",
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
