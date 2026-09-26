"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandRoot,
} from "cmdk";
import { Search } from "lucide-react";

import {
  searchGroups,
  type SearchEntry,
  type SearchIndex,
} from "@/lib/command/types";
import { setPrefs, usePrefs } from "@/lib/prefs-store";
import { Kbd } from "@/components/ui";
import { Dialog } from "@/components/ui/dialog";

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
let ownerRequest: Promise<boolean> | null = null;

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

/** Whether this browser holds an owner session; the "Owner" entry only shows up when it does. */
function loadOwner(): Promise<boolean> {
  ownerRequest ??= fetch("/api/owner/session")
    .then(async (response) => {
      if (!response.ok) {
        await response.body?.cancel();
        return false;
      }
      const data: unknown = await response.json();
      return (
        typeof data === "object" &&
        data !== null &&
        "owner" in data &&
        data.owner === true
      );
    })
    .catch(() => false);
  return ownerRequest;
}

const OWNER_ENTRY: SearchEntry = {
  id: "page:/owner",
  title: "Owner",
  subtitle: "Moderation sign-in",
  group: "Pages",
  href: "/owner",
  keywords: ["moderate", "sign in", "admin"],
};

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
  const [index, setIndex] = React.useState<SearchIndex | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [owner, setOwner] = React.useState(false);
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
    if (!open) return;
    let cancelled = false;
    loadOwner().then((isOwner) => {
      if (!cancelled) setOwner(isOwner);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

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

  const email = index?.email;

  const actions = React.useMemo(
    () =>
      buildActions({
        email,
        theme: prefs.theme,
        motion: prefs.motion,
        sound: prefs.sound,
        scene: prefs.scene,
      }),
    [email, prefs.theme, prefs.motion, prefs.sound, prefs.scene]
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
   * match first. cmdk sorts items within a group but not the groups, so the
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
        let items: Item[] =
          group === "Actions"
            ? actions
            : (index?.entries ?? []).filter(
                (entry) =>
                  entry.group === group &&
                  (hasQuery || !shownAsRecent.has(entry.id))
              );
        if (group === "Pages" && owner) items = [...items, OWNER_ENTRY];
        return { group, items, score: hasQuery ? bestScore(items) : 0 };
      })
      .filter(({ items }) => items.length > 0)
      .sort((a, b) => b.score - a.score);
  }, [index, failed, actions, hasQuery, search, recentEntries, owner]);

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
        close(() => navigate("/resume", (href) => router.push(href)), {
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
        className="top-[max(1rem,12vh)] w-[min(40rem,calc(100vw-2rem))] translate-y-0 overflow-hidden p-0"
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
          <div className="flex items-center gap-3 border-b border-line px-4">
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
                close(() => navigate(href, (to) => router.push(to)), {
                  focusBack: false,
                });
              }}
              placeholder="Search or jump to…"
              aria-label="Search pages, projects, work and actions"
              enterKeyHint="go"
              className="h-12 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint sm:text-sm"
            />
            <Kbd className="hidden fine:inline-flex">esc</Kbd>
          </div>

          <CommandList
            label="Results"
            className="max-h-[min(26rem,60dvh)] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-mono-xs [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-ink-faint [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group]+[cmdk-group]]:mt-1"
          >
            <CommandEmpty className="px-4 py-10 text-center text-sm">
              {index ? (
                <>
                  <p className="text-ink-soft">
                    No results for “{search.trim()}”
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
            <p className="border-t border-line px-4 py-2 text-xs text-ink-faint">
              The search index didn’t load. Actions still work; reopen to retry.
            </p>
          )}

          <div
            aria-hidden
            className="hidden items-center gap-4 border-t border-line px-4 py-2 font-mono text-mono-xs text-ink-faint fine:sm:flex"
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
      </Dialog>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </>
  );
}
