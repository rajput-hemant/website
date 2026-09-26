"use client";

import { Dialog } from "@/flavors/press/components/ui/dialog";
import { Kbd } from "@/flavors/press/components/ui/kbd";
import { RegMark } from "@/flavors/press/components/ui/reg-mark";
import { setPrefs, usePrefs } from "@/flavors/press/lib/prefs-store";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandRoot,
} from "cmdk";

import { filter } from "@/lib/command/items";
import { useCommandDialog } from "@/components/semantic/command/use-command-dialog";

import { CommandRow } from "./command-row";
import { actionCopy } from "./copy";
import { goSequence } from "./shortcuts";

/** The ⌘K menu: cmdk inside the edition's Dialog, run by the shared controller. */
export function CommandDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const menu = useCommandDialog({
    open,
    onOpenChange,
    prefs: usePrefs(),
    setPrefs,
    copy: actionCopy,
    goSequence,
  });

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={menu.onDialogOpenChange}
        title="Search the site"
        hideTitle
        className="top-[max(1rem,12vh)] p-0 sm:top-[max(1rem,12vh)] sm:max-w-[40rem] sm:translate-y-0 sm:data-ending-style:translate-y-0 sm:data-starting-style:translate-y-0"
      >
        <CommandRoot
          label="Search the site"
          filter={filter}
          loop
          {...menu.rootProps}
          className="flex min-h-0 flex-col"
        >
          <div className="flex items-center gap-3 border-b border-rule px-4">
            <RegMark className="size-4 shrink-0" />
            <CommandInput
              {...menu.inputProps}
              placeholder="Search or jump to a sheet"
              aria-label="Search pages, projects, work and actions"
              enterKeyHint="go"
              className="h-14 min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:font-medium placeholder:text-ink-soft"
            />
            <Kbd className="hidden fine:inline-flex">esc</Kbd>
          </div>

          <CommandList
            label="Results"
            className="max-h-[min(26rem,60dvh)] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:slug"
          >
            <CommandEmpty className="px-4 py-10 text-center text-sm">
              {menu.index ? (
                <>
                  <p>No proof for “{menu.search.trim()}”</p>
                  <p className="mt-1 text-ink-soft">
                    Try a project, a company, a stack or a year.
                  </p>
                </>
              ) : (
                <p className="text-ink-soft">
                  {menu.failed ? "Couldn’t load the search index." : "Loading…"}
                </p>
              )}
            </CommandEmpty>

            {!menu.hasQuery && menu.recentEntries.length > 0 && (
              <CommandGroup heading="Recent">
                {menu.recentEntries.map((entry) => (
                  <CommandRow
                    key={`recent:${entry.id}`}
                    value={`recent:${entry.id}`}
                    item={entry}
                    search={menu.search}
                    copied={false}
                    onSelect={() => menu.select(entry)}
                  />
                ))}
              </CommandGroup>
            )}
            {menu.groups.map(({ group, items }) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => (
                  <CommandRow
                    key={item.id}
                    value={item.id}
                    item={item}
                    search={menu.search}
                    copied={menu.copiedId === item.id}
                    onSelect={() => menu.select(item)}
                  />
                ))}
              </CommandGroup>
            ))}
          </CommandList>

          {menu.failed && (
            <p className="border-t border-rule px-4 py-2 text-sm text-ink-soft">
              The search index didn’t load. Actions still work; reopen to retry.
            </p>
          )}

          <div
            aria-hidden
            className="hidden items-center gap-4 border-t border-rule px-4 py-2 slug fine:sm:flex"
          >
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> move
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd> open
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Kbd>g</Kbd> then a sheet number jumps to it
            </span>
          </div>
        </CommandRoot>
      </Dialog>
      <p className="sr-only" role="status">
        {menu.announcement}
      </p>
    </>
  );
}
