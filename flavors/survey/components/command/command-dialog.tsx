"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/flavors/survey/components/ui/dialog";
import { Kbd } from "@/flavors/survey/components/ui/kbd";
import { setPrefs, usePrefs } from "@/flavors/survey/lib/prefs-store";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandRoot,
} from "cmdk";
import { Search } from "lucide-react";

import { navigateTo } from "@/lib/command/navigate";
import type { SearchEntry } from "@/lib/command/types";
import { useCommandData } from "@/components/semantic/command/use-command-data";

import { CommandRow } from "./command-row";
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
 * inside the shared Dialog (portal, focus trap, scroll lock, Esc).
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
      <Dialog
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
        title="Search the site"
        hideTitle
        // The title row (just the close button here) sits over the right end of the search strip.
        className="overflow-hidden p-0 pb-[env(safe-area-inset-bottom)] sm:top-[max(1rem,12vh)] sm:max-w-[40rem] sm:translate-y-0 sm:pb-0 sm:data-[ending-style]:translate-y-2 sm:data-[starting-style]:translate-y-2 [&>div:first-child]:absolute [&>div:first-child]:top-3.5 [&>div:first-child]:right-3.5 [&>div:first-child]:z-10 [&>div:last-child]:mt-0"
      >
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
          <div className="flex items-center gap-3 border-b border-rule-strong pr-14 pl-4">
            <span
              aria-hidden
              className="caps whitespace-nowrap text-water max-[22rem]:hidden"
            >
              Go to grid
            </span>
            <Search
              aria-hidden
              strokeWidth={1.75}
              className="size-4 shrink-0 text-ink-faint"
            />
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
              className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
            />
          </div>

          <CommandList
            label="Results"
            className="max-h-[min(26rem,60dvh)] scroll-py-1.5 overflow-y-auto overscroll-contain py-1.5 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-caps [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-contour-ink [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group]+[cmdk-group]]:mt-1 [&_[cmdk-group]+[cmdk-group]]:border-t [&_[cmdk-group]+[cmdk-group]]:border-rule"
          >
            <CommandEmpty className="px-4 py-10 text-center text-sm">
              {index ? (
                <>
                  <p className="text-ink-soft">
                    Nothing on the sheet for “{search.trim()}”
                  </p>
                  <p className="mt-1 text-ink-faint">
                    Try a project, a company, a stack or a year.
                  </p>
                </>
              ) : (
                <p className="text-ink-faint">
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
            <p className="border-t border-rule px-4 py-2 text-sm text-ink-faint">
              The search index didn’t load. Actions still work; reopen to retry.
            </p>
          )}

          <div
            aria-hidden
            className="caps hidden items-center gap-4 border-t border-rule px-4 py-2.5 text-ink-faint fine:sm:flex"
          >
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              Move
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              Open
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>esc</Kbd>
              Close
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Kbd>g</Kbd>
              then a letter jumps to a page
            </span>
          </div>
        </CommandRoot>
      </Dialog>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </>
  );
}
