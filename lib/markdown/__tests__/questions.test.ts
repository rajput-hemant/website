import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Question } from "@/lib/data/types";

const { getQuestions } = vi.hoisted(() => ({
  getQuestions: vi.fn(),
}));
vi.mock("@/lib/data", () => ({ getQuestions }));

const { findPublishedQuestion } = await import("../questions");
const { renderMarkdown } = await import("..");

function entry(slug: string): Question {
  return {
    id: slug,
    slug,
    body: `Question ${slug}?`,
    status: "published",
    replies: [],
    submittedAt: "2026-09-20T10:00:00Z",
  };
}

beforeEach(() => {
  getQuestions.mockReset();
  getQuestions.mockResolvedValue({
    items: [entry("Known123"), entry("Other456")],
    total: 2,
  });
});

describe("findPublishedQuestion", () => {
  it("finds a published entry in the shared list", async () => {
    await expect(findPublishedQuestion("Known123")).resolves.toMatchObject({
      slug: "Known123",
    });
    expect(getQuestions).toHaveBeenCalledWith({ page: 1, pageSize: 100 });
  });

  it("answers an unknown, well-formed slug from the list with no fetch of its own", async () => {
    await expect(findPublishedQuestion("Unknown1")).resolves.toBeNull();
    expect(getQuestions).toHaveBeenCalledTimes(1);
    expect(getQuestions).toHaveBeenCalledWith({ page: 1, pageSize: 100 });
  });

  it("never reads data for a malformed slug", async () => {
    await expect(findPublishedQuestion("../etc")).resolves.toBeNull();
    expect(getQuestions).not.toHaveBeenCalled();
  });
});

describe("renderMarkdown for /ask entries", () => {
  it("renders a published entry and 404s an unknown one without a per-slug fetch", async () => {
    await expect(renderMarkdown("ask/Known123")).resolves.toContain(
      "# Question Known123?"
    );
    await expect(renderMarkdown("ask/Unknown1")).resolves.toBeNull();
  });
});
