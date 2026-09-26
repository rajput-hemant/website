"use client";

import * as React from "react";

import { filter, keywordsFor, type Item } from "@/lib/command/items";
import { loadOwnerSession, loadSearchIndex } from "@/lib/command/load-index";
import { localizeSearchIndex } from "@/lib/command/localize-index";
import { readFlavorFromDocument } from "@/lib/command/read-flavor";
import { pushRecent, readRecent } from "@/lib/command/recent";
import {
  searchGroups,
  type SearchEntry,
  type SearchGroup,
  type SearchIndex,
} from "@/lib/command/types";

const RECENT_LIMIT = 5;

export type CommandGroupData<A extends string> = {
  group: SearchGroup;
  items: Item<A>[];
  score: number;
};

/**
 * The ⌘K menu's data: the search index (loaded on first open, retried after
 * a failure), recents, and the groups to show for the current query. The
 * edition supplies its actions and, optionally, a page that only appears for
 * the signed-in owner.
 */
export function useCommandData<A extends string>({
  open,
  search,
  makeActions,
  ownerEntry,
}: {
  open: boolean;
  search: string;
  /** The edition's actions for the site's email (unknown until the index loads). Keep it stable with useCallback. */
  makeActions: (email: string | undefined) => Item<A>[];
  ownerEntry?: SearchEntry;
}) {
  const [index, setIndex] = React.useState<SearchIndex | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [owner, setOwner] = React.useState(false);
  const [recent, setRecent] = React.useState(readRecent);

  React.useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    loadSearchIndex().then(
      (data) => {
        if (cancelled) return;
        setIndex(localizeSearchIndex(data, readFlavorFromDocument()));
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

  const wantsOwner = ownerEntry !== undefined;
  React.useEffect(() => {
    if (!open || !wantsOwner) return;
    let cancelled = false;
    loadOwnerSession().then((isOwner) => {
      if (!cancelled) setOwner(isOwner);
    });
    return () => {
      cancelled = true;
    };
  }, [open, wantsOwner]);

  const email = index?.email;
  const actions = React.useMemo(() => makeActions(email), [makeActions, email]);
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
  const groups = React.useMemo((): CommandGroupData<A>[] => {
    if (!index && !failed) return [];
    const shownAsRecent = new Set(recentEntries.map((entry) => entry.id));
    const bestScore = (items: Item<A>[]) =>
      Math.max(
        0,
        ...items.map((item) => filter(item.id, search, keywordsFor(item)))
      );
    return searchGroups
      .filter((group) => hasQuery || group === "Pages" || group === "Actions")
      .map((group) => {
        let items: Item<A>[] =
          group === "Actions"
            ? actions
            : (index?.entries ?? []).filter(
                (entry) =>
                  entry.group === group &&
                  (hasQuery || !shownAsRecent.has(entry.id))
              );
        if (group === "Pages" && owner && ownerEntry) {
          items = [...items, ownerEntry];
        }
        return { group, items, score: hasQuery ? bestScore(items) : 0 };
      })
      .filter(({ items }) => items.length > 0)
      .sort((a, b) => b.score - a.score);
  }, [
    index,
    failed,
    actions,
    hasQuery,
    search,
    recentEntries,
    owner,
    ownerEntry,
  ]);

  const remember = React.useCallback((id: string) => {
    setRecent(pushRecent(id));
  }, []);

  return { index, failed, hasQuery, recentEntries, groups, remember };
}
