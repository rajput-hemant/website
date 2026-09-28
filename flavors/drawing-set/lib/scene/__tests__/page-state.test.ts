// @vitest-environment jsdom
import {
  entriesFor,
  pageState,
  usePageEntries,
  type PageEntry,
} from "@/flavors/drawing-set/lib/scene/page-state";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

const entries: PageEntry[] = [
  { id: "project:a", href: "/projects/a", match: true },
  { id: "project:b", href: "/projects/b", match: false, kind: "archived" },
];

afterEach(() => pageState.setState({ route: null, entries: [] }));

describe("page state", () => {
  it("publishes a page's entries for its own route only", () => {
    const { unmount } = renderHook(() => usePageEntries("projects", entries));
    expect(entriesFor("projects")).toEqual(entries);
    expect(entriesFor("now")).toBeNull();
    unmount();
    expect(entriesFor("projects")).toBeNull();
  });

  it("leaves a newer page's entries alone when an older one unmounts", () => {
    const older = renderHook(() => usePageEntries("projects", entries));
    renderHook(() => usePageEntries("now", entries));
    older.unmount();
    expect(entriesFor("now")).toEqual(entries);
  });
});
