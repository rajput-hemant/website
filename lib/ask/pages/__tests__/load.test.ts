import { beforeEach, describe, expect, it, vi } from "vitest";

import { getQuestions } from "@/lib/data";

import { ASK_PAGE_SIZE } from "../pagination";
import { askListMetadata, loadAskList, resolveAskPage } from "../load";

vi.mock("@/lib/data", () => ({ getQuestions: vi.fn() }));

describe("ask page loaders", () => {
  beforeEach(() => {
    vi.mocked(getQuestions).mockResolvedValue({ items: [], total: 41 });
  });

  it("loads the requested page and derives its page count", async () => {
    expect(await loadAskList(2)).toEqual({
      items: [],
      total: 41,
      pageCount: 3,
    });
    expect(getQuestions).toHaveBeenCalledWith({
      page: 2,
      pageSize: ASK_PAGE_SIZE,
    });
  });

  it("rejects segments that aren't page numbers", async () => {
    expect(await resolveAskPage("abc")).toBeNull();
    expect(await resolveAskPage("1")).toBeNull();
  });

  it("returns no metadata for a page that doesn't exist", async () => {
    expect(await askListMetadata("9999")).toEqual({});
  });
});
