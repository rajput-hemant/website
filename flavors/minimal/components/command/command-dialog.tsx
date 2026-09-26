"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { announceCopied } from "@/flavors/minimal/components/interaction/cursor-events";
import { Kbd } from "@/flavors/minimal/components/ui/kbd";
import { setPrefs } from "@/flavors/minimal/lib/prefs-store";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandRoot,
} from "cmdk";
import { Search } from "lucide-react";

import { searchGroups, type SearchIndex } from "@/lib/command/types";
import { isMirrorSlug, markdownSlug } from "@/lib/markdown/slugs";
import { usePublicPathname } from "@/lib/public-pathname";

import { OPEN_CUSTOMIZE_EVENT } from "./command-events";
import { CommandRow } from "./command-row";
import {
  buildActions,
  filter,
  isAction,
  keywordsFor,
  type ActionItem,
  type Item,
} from "./items";
import { pushRecent, readRecent } from "./recent";
import { goSequence } from "./shortcuts";

const COPIED_CLOSE_DELAY_MS = 700;
const ANNOUNCEMENT_CLEAR_MS = 4000;
const RECENT_LIMIT = 5;
let indexRequest: Promise<SearchIndex> | null = null;

/** One fetch per page load; a failure clears it so the next open retries. */
function loadIndex(): Promise<SearchIndex> {
  indexRequest ??= fetch("/search.json")
    .then(async (response) => {
      if (!response.ok) {
        // Release the unread body, or Chromium keeps the request open.
        await response.body?.cancel();
        throw new Error(`search.json: ${response.status}`);
      }
      return response.json() as Promise<SearchIndex>;
    })
    .catch((error: unknown) => {
      indexRequest = null;
      throw error;
    });
  return indexRequest;
}

/**
 * cmdk 1.1 computes `aria-activedescendant` before the selected item's DOM
 * updates, so it starts empty and lags a step behind while typing. Mirror the
 * real selection onto the input and listbox instead. A ref callback on the
 * list: React 19 runs the returned cleanup when it unmounts.
 */
function syncActiveDescendant(list: HTMLDivElement | null) {
  const input = list?.closest("[cmdk-root]")?.querySelector("[cmdk-input]");
  if (!list || !input) return;
  const sync = () => {
    const id = list.querySelector('[cmdk-item][aria-selected="true"]')?.id;
    for (const element of [input, list]) {
      if (!id) element.removeAttribute("aria-activedescendant");
      else if (element.getAttribute("aria-activedescendant") !== id)
        element.setAttribute("aria-activedescendant", id);
    }
  };
  const observer = new MutationObserver(sync);
  const attributeFilter = ["aria-selected", "aria-activedescendant"];
  observer.observe(list, { subtree: true, childList: true, attributeFilter });
  observer.observe(input, { attributeFilter });
  sync();
  return () => observer.disconnect();
}

/**
 * Client navigation, except within the current page: there the hash is set
 * directly so `hashchange` fires and the target disclosure opens.
 */
function navigate(href: string, push: (href: string) => void) {
  const url = new URL(href, window.location.href);
  if (url.pathname !== window.location.pathname) {
    push(href);
    return;
  }
  if (!url.hash) return;
  if (url.hash === window.location.hash) {
    document
      .getElementById(decodeURIComponent(url.hash.slice(1)))
      ?.scrollIntoView();
  } else {
    window.location.hash = url.hash;
  }
}

export type CommandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * The ⌘K menu: cmdk (combobox, listbox, filtering, arrow/Home/End/Enter)
 * inside the Radix Dialog that cmdk already depends on (portal, focus trap,
 * scroll lock, Esc), so no second dialog library loads. Only the backdrop
 * fades (120ms); the panel never animates because it is summoned from the
 * keyboard and used often.
 */
export function CommandDialog({ open, onOpenChange }: CommandDialogProps) {
  const router = useRouter();
  const pathname = usePublicPathname();
  const restoreFocus = React.useRef(true);
  const afterClose = React.useRef<(() => void) | null>(null);
  const newTab = React.useRef(false);
  const goStartedAt = React.useRef<number | null>(null);

  const [search, setSearch] = React.useState("");
  const [index, setIndex] = React.useState<SearchIndex | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [recent, setRecent] = React.useState(readRecent);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  React.useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    loadIndex().then(
      (data) => {
        if (cancelled) return;
        setIndex(data);
        setFailed(false);
      },
      () => {
        if (!cancelled) setFailed(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [open, index]);

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

  const mirrorSlug = markdownSlug(pathname);
  const email = index?.email;

  const actions = React.useMemo(
    () =>
      buildActions({
        email,
        markdownPath: isMirrorSlug(mirrorSlug)
          ? `/${mirrorSlug}.md`
          : undefined,
      }),
    [email, mirrorSlug]
  );

  const hasQuery = search.trim() !== "";

  const recentEntries = React.useMemo(() => {
    const byId = new Map(index?.entries.map((entry) => [entry.id, entry]));
    return recent
      .map((id) => byId.get(id))
      .filter((entry) => entry !== undefined)
      .slice(0, RECENT_LIMIT);
  }, [index, recent]);

  /**
   * With no query: recents, pages and actions. With one: every group, best
   * match first. cmdk sorts items within a group but not the groups (1.1
   * looks them up by `data-value` while registering them by id), so the
   * group order is set here with the same filter. Nothing renders until the
   * index settles, so the option cmdk selects on mount is the right one.
   */
  const groups = React.useMemo(() => {
    if (!index && !failed) return [];
    const shownAsRecent = new Set(recentEntries.map((entry) => entry.id));
    const bestScore = (items: Item[]) =>
      Math.max(
        0,
        ...items.map((item) => filter(item.id, search, keywordsFor(item)))
      );
    return searchGroups
      .filter((group) => hasQuery || group === "Pages" || group === "Actions")
      .map((group) => {
        const items: Item[] =
          group === "Actions"
            ? actions
            : (index?.entries ?? []).filter(
                (entry) =>
                  entry.group === group &&
                  (hasQuery || !shownAsRecent.has(entry.id))
              );
        return { group, items, score: hasQuery ? bestScore(items) : 0 };
      })
      .filter(({ items }) => items.length > 0)
      .sort((a, b) => b.score - a.score);
  }, [index, failed, actions, hasQuery, search, recentEntries]);

  const runAction = (item: ActionItem) => {
    switch (item.action) {
      case "copy-email": {
        if (!email) break;
        const address = email;
        navigator.clipboard.writeText(address).then(
          () => {
            announceCopied();
            setAnnouncement(`Copied ${address} to the clipboard`);
            setCopiedId(item.id);
            window.setTimeout(() => close(), COPIED_CLOSE_DELAY_MS);
          },
          () => setAnnouncement(`Couldn't copy. The email is ${address}`)
        );
        break;
      }
      case "theme":
        close(() => {
          const isDark = document.documentElement.dataset.theme === "dark";
          setPrefs({ theme: isDark ? "light" : "dark" });
        });
        break;
      case "customize":
        close(() => window.dispatchEvent(new Event(OPEN_CUSTOMIZE_EVENT)));
        break;
      case "markdown":
        // A plain document request: the .md mirror is a route handler, not a page.
        close(() => window.open(`/${mirrorSlug}.md`, "_self"), {
          focusBack: false,
        });
        break;
    }
  };

  const select = (item: Item) => {
    if (isAction(item)) {
      runAction(item);
      return;
    }
    setRecent(pushRecent(item.id));
    if (newTab.current) {
      window.open(item.href, "_blank", "noopener");
      return;
    }
    close(() => navigate(item.href, (href) => router.push(href)), {
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
        onOpenChange={(next) => {
          if (next) restoreFocus.current = true;
          onOpenChange(next);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 duration-120 ease-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            aria-describedby={undefined}
            onCloseAutoFocus={(event) => {
              if (!restoreFocus.current) event.preventDefault();
              setSearch("");
              setCopiedId(null);
              const then = afterClose.current;
              afterClose.current = null;
              // After the scroll lock and focus trap have let go.
              if (then) requestAnimationFrame(then);
            }}
            className="fixed top-[max(1rem,12vh)] left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-lg border border-hairline bg-background font-sans text-foreground shadow-popover outline-none"
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
              <div className="flex items-center gap-3 border-b border-hairline px-4">
                <Search
                  aria-hidden
                  strokeWidth={1.75}
                  className="size-4 shrink-0 text-subtle"
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
                    close(() => navigate(href, (to) => router.push(to)), {
                      focusBack: false,
                    });
                  }}
                  placeholder="Search or jump to…"
                  aria-label="Search pages, projects, work and actions"
                  enterKeyHint="go"
                  className="h-12 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-subtle sm:text-sm"
                />
                <Kbd className="hidden sm:pointer-fine:inline-flex">esc</Kbd>
              </div>

              <CommandList
                ref={syncActiveDescendant}
                label="Results"
                className="max-h-[min(26rem,60dvh)] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:meta [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group]+[cmdk-group]]:mt-1"
              >
                <CommandEmpty className="px-4 py-10 text-center text-sm">
                  {index ? (
                    <>
                      <p className="text-muted">
                        No results for “{search.trim()}”
                      </p>
                      <p className="mt-1 text-subtle">
                        Try a project, a company, a stack or a year.
                      </p>
                    </>
                  ) : (
                    <p className="text-subtle">
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
                <p className="border-t border-hairline px-4 py-2 text-xs text-subtle">
                  The search index didn’t load. Actions still work; reopen to
                  retry.
                </p>
              )}

              <div
                aria-hidden
                className="hidden items-center gap-4 border-t border-hairline px-4 py-2 text-xs text-subtle sm:pointer-fine:flex"
              >
                <span className="flex items-center gap-1.5">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>↵</Kbd>
                  open
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <Kbd>g</Kbd>
                  then a key jumps to a page
                </span>
              </div>
            </CommandRoot>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </>
  );
}
