import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";

import { renderMarkdown } from "..";

describe("/work markdown: margin notes", () => {
  it("includes each role's note after its section", async () => {
    const markdown = (await renderMarkdown("work")) ?? "";
    const withNotes = experience.filter((role) => role.note);
    expect(withNotes.length).toBeGreaterThan(0);
    for (const role of withNotes) {
      expect(markdown).toContain("*Why it mattered:* ");
      // Escaping may touch punctuation, so match on the first few words.
      const opening = (role.note ?? "").split(" ").slice(0, 3).join(" ");
      expect(markdown).toContain(opening);
    }
  });

  it("keeps fallback notes within the 140-character limit", () => {
    for (const role of experience) {
      if (role.note) expect(role.note.length).toBeLessThanOrEqual(140);
    }
  });
});
