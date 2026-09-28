import { describe, expect, it } from "vitest";

import { hostedResumeLabel } from "../hosted-resume";

describe("hostedResumeLabel", () => {
  it("names Google Drive and Docs links", () => {
    expect(
      hostedResumeLabel("https://drive.google.com/file/d/abc/view?usp=sharing")
    ).toBe("Google Drive");
    expect(hostedResumeLabel("https://docs.google.com/document/d/abc")).toBe(
      "Google Drive"
    );
  });

  it("falls back to the bare host", () => {
    expect(hostedResumeLabel("https://www.example.com/cv.pdf")).toBe(
      "example.com"
    );
  });

  it("survives a malformed URL", () => {
    expect(hostedResumeLabel("not a url")).toBe("the web");
  });
});
