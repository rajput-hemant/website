"use client";

import { Dialog } from "@/flavors/darkroom/components/ui/dialog";
import { Kbd } from "@/flavors/darkroom/components/ui/kbd";
import { setPrefs, usePrefs } from "@/flavors/darkroom/lib/prefs-store";
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

const hrefForUpdate = (year: string) => `/now#log-${year}`;

/** The ⌘K menu: cmdk inside the edition's Dialog, run by the shared controller. */
export function CommandDialog({
  open,
  instant,
  onOpenChange,
}: {
  open: boolean;
  /** Opened from the keyboard: appear at once, no motion. */
  instant: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const menu = useCommandDialog({
    open,
    onOpenChange,
    prefs: usePrefs(),
    setPrefs,
    copy: actionCopy,
    goSequence,
    hrefForUpdate,
  });

  return (
    <>
      <Dialog
        open={open}
        instant={instant}
        onOpenChange={menu.onDialogOpenChange}
        title="Search the site"
        hideTitle
        className="p-0 sm:top-[max(1rem,12vh)] sm:max-w-[40rem] sm:translate-y-0 motion:sm:data-ending-style:translate-y-0 motion:sm:data-starting-style:translate-y-0"
      >
        <CommandRoot
          label="Search the site"
          filter={filter}
          loop
          {...menu.rootProps}
          className="flex min-h-0 flex-col"
        >
          <div className="flex items-center gap-3 border-b border-line px-4">
            <span aria-hidden className="edge text-edge-lg text-grease">
              ▸
            </span>
            <CommandInput
              {...menu.inputProps}
              placeholder="Search the roll, or jump to a frame"
              aria-label="Search pages, projects, work and actions"
              enterKeyHint="go"
              className="h-14 min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-faint"
            />
            <Kbd className="hidden fine:inline-flex">esc</Kbd>
          </div>

          <CommandList
            label="Results"
            className="max-h-[min(26rem,60dvh)] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:edge"
          >
            <CommandEmpty className="px-4 py-10 text-center text-sm">
              {menu.index ? (
                <>
                  <p>Nothing on the roll for “{menu.search.trim()}”</p>
                  <p className="mt-1 text-soft">
                    Try a project, a company, a stack or a year.
                  </p>
                </>
              ) : (
                <p className="text-soft">
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
            <p className="border-t border-line px-4 py-2 text-sm text-soft">
              The search index didn’t load. Actions still work; reopen to retry.
            </p>
          )}

          <div
            aria-hidden
            className="hidden items-center gap-4 border-t border-line px-4 py-2 edge fine:sm:flex"
          >
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> move
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd> open
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Kbd>g</Kbd> then a frame number
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
