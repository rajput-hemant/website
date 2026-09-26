"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { setPrefs, usePrefs } from "@/flavors/surface/lib/prefs-store";
import { Dialog } from "@base-ui/react/dialog";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandRoot,
} from "cmdk";

import { navigateTo } from "@/lib/command/navigate";
import type { SearchEntry } from "@/lib/command/types";
import { useCommandData } from "@/components/semantic/command/use-command-data";

import { CommandRow, kbdClass } from "./command-row";
import {
  buildActions,
  filter,
  isAction,
  type ActionItem,
  type Item,
} from "./items";
import { goSequence } from "./shortcuts";

const COPIED_CLOSE_DELAY_MS = 700;
const ANNOUNCEMENT_CLEAR_MS = 4000;

const OWNER_ENTRY: SearchEntry = {
  id: "page:/owner",
  title: "Owner",
  subtitle: "Moderation sign-in",
  group: "Pages",
  href: "/owner",
  keywords: ["moderate", "sign in", "admin"],
};

export type CommandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * The ⌘K menu: cmdk (combobox, listbox, filtering, arrow/Home/End/Enter)
 * inside a Base UI dialog (portal, focus trap, scroll lock, Esc), dressed as
 * a module with a glass search well. Opened hundreds of times a day, so it
 * only fades, quickly.
 */
export function CommandDialog({ open, onOpenChange }: CommandDialogProps) {
  const router = useRouter();
  const prefs = usePrefs();
  const restoreFocus = React.useRef(true);
  const afterClose = React.useRef<(() => void) | null>(null);
  const newTab = React.useRef(false);
  const goStartedAt = React.useRef<number | null>(null);

  const [search, setSearch] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  React.useEffect(() => {
    if (!announcement) return;
    const timer = window.setTimeout(
      () => setAnnouncement(""),
      ANNOUNCEMENT_CLEAR_MS
    );
    return () => window.clearTimeout(timer);
  }, [announcement]);

  /** `then` runs once the dialog has fully closed, after focus and scroll are released. */
  const close = React.useCallback(
    (then?: () => void, { focusBack = true } = {}) => {
      restoreFocus.current = focusBack;
      afterClose.current = then ?? null;
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const makeActions = React.useCallback(
    (email: string | undefined) =>
      buildActions({
        email,
        theme: prefs.theme,
        motion: prefs.motion,
        sound: prefs.sound,
        scene: prefs.scene,
      }),
    [prefs.theme, prefs.motion, prefs.sound, prefs.scene]
  );

  const { index, failed, hasQuery, recentEntries, groups, remember } =
    useCommandData({ open, search, makeActions, ownerEntry: OWNER_ENTRY });
  const email = index?.email;

  const runAction = (item: ActionItem) => {
    switch (item.action) {
      case "copy-email": {
        if (!email) break;
        const address = email;
        navigator.clipboard.writeText(address).then(
          () => {
            setAnnouncement(`Copied ${address} to the clipboard`);
            setCopiedId(item.id);
            window.setTimeout(() => close(), COPIED_CLOSE_DELAY_MS);
          },
          () => setAnnouncement(`Couldn't copy. The email is ${address}`)
        );
        break;
      }
      case "resume":
        close(() => navigateTo("/resume", (href) => router.push(href)), {
          focusBack: false,
        });
        break;
      case "toggle-theme":
        close(() => {
          const isDark = document.documentElement.dataset.theme === "dark";
          setPrefs({ theme: isDark ? "light" : "dark" });
        });
        break;
      case "toggle-motion":
        setPrefs({ motion: !prefs.motion });
        close();
        break;
      case "toggle-sound":
        setPrefs({ sound: !prefs.sound });
        close();
        break;
      case "scene-auto":
        setPrefs({ scene: "auto" });
        close();
        break;
      case "scene-low":
        setPrefs({ scene: "low" });
        close();
        break;
      case "scene-off":
        setPrefs({ scene: "off" });
        close();
        break;
    }
  };

  const select = (item: Item) => {
    if (isAction(item)) {
      runAction(item);
      return;
    }
    remember(item.id);
    if (newTab.current) {
      window.open(item.href, "_blank", "noopener");
      return;
    }
    close(() => navigateTo(item.href, (href) => router.push(href)), {
      focusBack: false,
    });
  };

  const renderItem = (item: Item, value = item.id) => (
    <CommandRow
      key={value}
      value={value}
      item={item}
      search={search}
      copied={copiedId === item.id}
      onSelect={() => select(item)}
    />
  );

  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={(next: boolean) => {
          if (next) restoreFocus.current = true;
          if (!next) {
            setSearch("");
            setCopiedId(null);
            const then = afterClose.current;
            afterClose.current = null;
            if (then) requestAnimationFrame(then);
          }
          onOpenChange(next);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-plate/70 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion:transition-opacity motion:duration-100" />
          <Dialog.Popup
            finalFocus={() => restoreFocus.current}
            className="mod fixed top-[max(1rem,12vh)] left-1/2 z-50 flex max-h-[80svh] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden p-2.5 shadow-[inset_0_1px_0_var(--color-hi),0_0_0_1px_var(--color-seam),0_28px_60px_-24px_rgb(0_0_0/0.55)] outline-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion:transition-opacity motion:duration-100"
          >
            <Dialog.Title className="sr-only">Search the site</Dialog.Title>
            <CommandRoot
              label="Search the site"
              filter={filter}
              loop
              // cmdk's onSelect carries no event; remember ⌘/Ctrl for "open in a new tab".
              onKeyDownCapture={(event) => {
                newTab.current = event.metaKey || event.ctrlKey;
              }}
              onPointerDownCapture={(event) => {
                newTab.current = event.metaKey || event.ctrlKey;
              }}
              className="flex min-h-0 flex-col"
            >
              <div className="glass flex items-center gap-3 px-4">
                <span aria-hidden className="legend shrink-0 text-[0.59375rem]">
                  Find
                </span>
                <CommandInput
                  value={search}
                  onValueChange={(next) => {
                    // A lone `g` typed into an empty field may start a page jump.
                    goStartedAt.current =
                      search === "" && next === "g" ? Date.now() : null;
                    setSearch(next);
                  }}
                  onKeyDown={(event) => {
                    const href = goSequence(
                      search,
                      goStartedAt.current,
                      event.nativeEvent
                    );
                    if (!href) return;
                    event.preventDefault();
                    goStartedAt.current = null;
                    close(() => navigateTo(href, (to) => router.push(to)), {
                      focusBack: false,
                    });
                  }}
                  placeholder="Search or jump to…"
                  aria-label="Search pages, projects, work and actions"
                  enterKeyHint="go"
                  className="matrix h-12 min-w-0 flex-1 bg-transparent text-base text-lcd-ink normal-case outline-none placeholder:text-lcd-ink-2 sm:text-[0.9375rem]"
                />
                <kbd
                  aria-hidden
                  className={`${kbdClass} hidden fine:inline-flex`}
                >
                  esc
                </kbd>
              </div>

              <CommandList
                label="Results"
                className="mt-2 max-h-[min(26rem,60dvh)] scroll-py-1.5 overflow-y-auto overscroll-contain px-0.5 pb-0.5 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:text-legend [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-ink-2 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group]+[cmdk-group]]:mt-1"
              >
                <CommandEmpty className="px-4 py-10 text-center text-sm">
                  {index ? (
                    <>
                      <p className="text-ink">
                        No results for “{search.trim()}”
                      </p>
                      <p className="mt-1 text-ink-2">
                        Try a project, a company, a stack or a year.
                      </p>
                    </>
                  ) : (
                    <p className="text-ink-2">
                      {failed ? "Couldn’t load the search index." : "Loading…"}
                    </p>
                  )}
                </CommandEmpty>

                {!hasQuery && recentEntries.length > 0 && (
                  <CommandGroup heading="Recent">
                    {recentEntries.map((entry) =>
                      renderItem(entry, `recent:${entry.id}`)
                    )}
                  </CommandGroup>
                )}
                {groups.map(({ group, items }) => (
                  <CommandGroup key={group} heading={group}>
                    {items.map((item) => renderItem(item))}
                  </CommandGroup>
                ))}
              </CommandList>

              {failed && (
                <p className="seam-t mt-1 px-3 pt-2 text-xs text-ink-2">
                  The search index didn’t load. Actions still work; reopen to
                  retry.
                </p>
              )}

              <div
                aria-hidden
                className="seam-t legend mt-2 hidden items-center gap-4 px-3 pt-2.5 pb-1 text-[0.625rem] fine:sm:flex"
              >
                <span className="flex items-center gap-1.5">
                  <kbd className={kbdClass}>↑</kbd>
                  <kbd className={kbdClass}>↓</kbd>
                  Turn
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className={kbdClass}>↵</kbd>
                  Open
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <kbd className={kbdClass}>g</kbd>
                  then a key jumps to a page
                </span>
              </div>
            </CommandRoot>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </>
  );
}
