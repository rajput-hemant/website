"use client";

import { createElement, type ComponentType, type SVGProps } from "react";
import { CommandItem } from "cmdk";
import {
  Briefcase,
  Check,
  FileCode2,
  FileText,
  FlaskConical,
  FolderGit2,
  History,
  Mail,
  MessageCircle,
  SlidersHorizontal,
  SunMoon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";

import { highlightSegments } from "./highlight";
import { isAction, keywordsFor, type Action, type Item } from "./items";
import { goKeyFor } from "./shortcuts";
import type { SearchEntry } from "./types";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

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
  theme: SunMoon,
  customize: SlidersHorizontal,
  markdown: FileCode2,
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
  const icon = copied
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
      className="group/row flex min-h-10 cursor-default items-center gap-3 rounded-md px-2.5 py-2 text-sm select-none data-[selected=true]:bg-surface-2"
    >
      {createElement(icon, {
        "aria-hidden": true,
        strokeWidth: 1.75,
        className: cn(
          "size-4 shrink-0",
          copied
            ? "text-accent"
            : "text-subtle group-data-[selected=true]/row:text-muted"
        ),
      })}
      <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span
          className={cn(
            "truncate font-normal",
            !dated && "max-w-full shrink-0"
          )}
        >
          <Title text={item.title} search={search} />
        </span>
        {subtitle && (
          <span
            className={cn(
              "text-subtle",
              dated
                ? "ml-auto hidden shrink-0 pl-2 text-xs whitespace-nowrap tabular-nums sm:inline"
                : "min-w-0 truncate"
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
      {goKey && (
        <span aria-hidden className="hidden shrink-0 gap-1 sm:flex">
          <Kbd>g</Kbd>
          <Kbd>{goKey}</Kbd>
        </span>
      )}
    </CommandItem>
  );
}
