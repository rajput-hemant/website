// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ActionItem } from "@/lib/command/items";
import { resetCommandRequests } from "@/lib/command/load-index";
import type { SearchEntry, SearchIndex } from "@/lib/command/types";

import { useCommandData } from "../use-command-data";

const page: SearchEntry = {
  id: "page:/projects",
  title: "Projects",
  group: "Pages",
  href: "/projects",
  keywords: [],
};
const index: SearchIndex = { email: "a@b.dev", entries: [page] };
const hrefForUpdate = (year: string) => `/now#log-${year}`;
const owner: SearchEntry = {
  ...page,
  id: "page:/owner",
  title: "Owner",
  href: "/owner",
};
const makeActions = (email: string | undefined): ActionItem<"copy">[] =>
  email
    ? [
        {
          id: "action:copy",
          title: "Copy email",
          group: "Actions",
          keywords: [],
          action: "copy",
        },
      ]
    : [];

function stubFetch(isOwner: boolean, searchIndex = index) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) =>
      Promise.resolve(
        new Response(
          JSON.stringify(
            url === "/search.json" ? searchIndex : { owner: isOwner }
          )
        )
      )
    )
  );
}

afterEach(() => {
  resetCommandRequests();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("useCommandData", () => {
  it("loads nothing while closed", () => {
    stubFetch(false);
    const { result } = renderHook(() =>
      useCommandData({ open: false, search: "", makeActions, hrefForUpdate })
    );
    expect(result.current.groups).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows pages and actions built from the index's email", async () => {
    stubFetch(false);
    const { result } = renderHook(() =>
      useCommandData({ open: true, search: "", makeActions, hrefForUpdate })
    );
    await waitFor(() => expect(result.current.index).not.toBeNull());
    expect(result.current.groups.map((g) => g.group)).toEqual([
      "Pages",
      "Actions",
    ]);
    expect(result.current.groups[1]!.items[0]!.id).toBe("action:copy");
  });

  it("localizes changelog links with the supplied route", async () => {
    const changelogIndex: SearchIndex = {
      ...index,
      entries: [
        {
          ...page,
          id: "update:1",
          title: "Shipped",
          group: "Changelog",
          href: "/changelog#2024",
        },
      ],
    };
    stubFetch(false, changelogIndex);
    const { result } = renderHook(() =>
      useCommandData({ open: true, search: "", makeActions, hrefForUpdate })
    );
    await waitFor(() => expect(result.current.index).not.toBeNull());
    expect(result.current.index?.entries[0]?.href).toBe("/now#log-2024");
  });

  it("adds the owner page only for the owner, and moves recents out of pages", async () => {
    stubFetch(true);
    const { result } = renderHook(() =>
      useCommandData({
        open: true,
        search: "",
        makeActions,
        hrefForUpdate,
        ownerEntry: owner,
      })
    );
    await waitFor(() =>
      expect(result.current.groups[0]?.items.map((i) => i.id)).toContain(
        "page:/owner"
      )
    );
    act(() => result.current.remember("page:/projects"));
    await waitFor(() => expect(result.current.recentEntries).toEqual([page]));
    expect(result.current.groups[0]!.items.map((i) => i.id)).toEqual([
      "page:/owner",
    ]);
  });
});
