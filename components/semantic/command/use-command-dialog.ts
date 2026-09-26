"use client";

import * as React from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import { isAction, type ActionItem, type Item } from "@/lib/command/items";
import { navigateTo } from "@/lib/command/navigate";
import {
  buildStandardActions,
  type ActionCopy,
  type StandardAction,
} from "@/lib/command/standard-actions";
import type { SearchEntry } from "@/lib/command/types";
import type { StandardPrefs } from "@/lib/prefs/standard";
import { useCommandData } from "@/components/semantic/command/use-command-data";

const COPIED_CLOSE_DELAY_MS = 700;
const ANNOUNCEMENT_CLEAR_MS = 4000;

export const OWNER_ENTRY: SearchEntry = {
  id: "page:/owner",
  title: "Owner",
  subtitle: "Moderation sign-in",
  group: "Pages",
  href: "/owner",
  keywords: ["moderate", "sign in", "admin"],
};

type GoSequence = (
  query: string,
  startedAt: number | null,
  event: KeyboardEvent
) => string | undefined;

/**
 * Everything the ⌘K dialog does, without markup, for editions on the
 * standard preferences: the index and groups, running actions, navigating
 * once the dialog has closed, ⌘/Ctrl-click for a new tab, the `g` jump from
 * an empty field, and the live announcement. The edition renders cmdk inside
 * its own Dialog and spreads the returned handlers.
 */
export function useCommandDialog({
  open,
  onOpenChange,
  prefs,
  setPrefs,
  copy,
  goSequence,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefs: StandardPrefs;
  setPrefs: (patch: Partial<StandardPrefs>) => void;
  copy: ActionCopy;
  goSequence: GoSequence;
}) {
  const router = useRouter();
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
  const close = (then?: () => void) => {
    afterClose.current = then ?? null;
    onOpenChange(false);
  };
  const go = (href: string) =>
    close(() => navigateTo(href, (to) => router.push(to as Route)));

  const { theme, motion, sound, scene } = prefs;
  const makeActions = React.useCallback(
    (email: string | undefined) =>
      buildStandardActions(copy, { email, theme, motion, sound, scene }),
    [copy, theme, motion, sound, scene]
  );

  const data = useCommandData({
    open,
    search,
    makeActions,
    ownerEntry: OWNER_ENTRY,
  });
  const email = data.index?.email;

  const runAction = (item: ActionItem<StandardAction>) => {
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
        go("/resume");
        break;
      case "toggle-theme":
        close(() => {
          const isDark = document.documentElement.dataset.theme === "dark";
          setPrefs({ theme: isDark ? "light" : "dark" });
        });
        break;
      case "toggle-motion":
        setPrefs({ motion: !motion });
        close();
        break;
      case "toggle-sound":
        setPrefs({ sound: !sound });
        close();
        break;
      case "scene-auto":
      case "scene-low":
      case "scene-off":
        setPrefs({ scene: item.action.slice(6) as StandardPrefs["scene"] });
        close();
        break;
    }
  };

  const select = (item: Item<StandardAction>) => {
    if (isAction(item)) {
      runAction(item);
      return;
    }
    data.remember(item.id);
    if (newTab.current) {
      window.open(item.href, "_blank", "noopener");
      return;
    }
    go(item.href);
  };

  const trackModifier = (event: React.KeyboardEvent | React.PointerEvent) => {
    newTab.current = event.metaKey || event.ctrlKey;
  };

  return {
    ...data,
    search,
    copiedId,
    announcement,
    select,
    /** Pass to the edition's Dialog. */
    onDialogOpenChange: (next: boolean) => {
      if (!next) {
        setSearch("");
        setCopiedId(null);
        const then = afterClose.current;
        afterClose.current = null;
        if (then) requestAnimationFrame(then);
      }
      onOpenChange(next);
    },
    /** Spread on cmdk's root. */
    rootProps: {
      onKeyDownCapture: trackModifier,
      onPointerDownCapture: trackModifier,
    },
    /** Spread on cmdk's input. */
    inputProps: {
      value: search,
      onValueChange: (next: string) => {
        // A lone `g` typed into an empty field may start a page jump.
        goStartedAt.current = search === "" && next === "g" ? Date.now() : null;
        setSearch(next);
      },
      onKeyDown: (event: React.KeyboardEvent) => {
        const href = goSequence(search, goStartedAt.current, event.nativeEvent);
        if (!href) return;
        event.preventDefault();
        goStartedAt.current = null;
        go(href);
      },
    },
  };
}
